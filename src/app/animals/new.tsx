import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StateMessage } from "@/components/StateMessage";
import { newAnimalSchema, type NewAnimalInput } from "@/features/animals/schemas/animal.schema";
import { useAnimal, useCreateAnimal, useUpdateAnimal } from "@/features/animals/hooks/useAnimals";
import { MAX_ANIMAL_PHOTOS, MAX_PHOTO_SIZE_BYTES } from "@/features/animals/photo.constants";
import type { AnimalHealth, AnimalPhotoInput, AnimalSize, AnimalSpecies } from "@/features/animals/types";
import { useAuth } from "@/features/auth/AuthProvider";

const speciesOptions: { value: AnimalSpecies; label: string }[] = [
  { value: "cachorro", label: "Cachorro" },
  { value: "gato", label: "Gato" },
  { value: "outro", label: "Outro" },
];
const sizeOptions: { value: AnimalSize; label: string }[] = [
  { value: "pequeno", label: "Pequeno" },
  { value: "medio", label: "Médio" },
  { value: "grande", label: "Grande" },
];
const healthOptions: { value: AnimalHealth; label: string }[] = [
  { value: "saudavel", label: "Saudável" },
  { value: "em_tratamento", label: "Em tratamento" },
  { value: "nao_informado", label: "Não informado" },
];

export default function NewAnimalScreen() {
  const auth = useAuth();
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const isEditing = Boolean(animalId);
  const existingAnimalQuery = useAnimal(animalId ?? "");
  const createAnimal = useCreateAnimal();
  const updateAnimal = useUpdateAnimal();
  const isSaving = createAnimal.isPending || updateAnimal.isPending;
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const loadedAnimalId = useRef<string | null>(null);
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<NewAnimalInput>({
    resolver: zodResolver(newAnimalSchema),
    defaultValues: {
      name: "",
      species: "cachorro",
      breed: "",
      city: "",
      state: "",
      photos: [],
      existingPhotoPaths: [],
      ageMonths: 0,
      size: "medio",
      healthStatus: "nao_informado",
      description: "",
    },
  });
  const requiresDonorProfile = auth.available;

  useEffect(() => {
    const animal = existingAnimalQuery.data;
    if (!animal || loadedAnimalId.current === animal.id) return;
    loadedAnimalId.current = animal.id;
    reset({
      name: animal.name,
      species: animal.species,
      breed: animal.breed ?? "",
      city: animal.city ?? "",
      state: animal.state ?? "",
      photos: [],
      existingPhotoPaths: animal.photoPaths,
      ageMonths: animal.ageMonths,
      size: animal.size,
      healthStatus: animal.healthStatus,
      description: animal.description,
    });
  }, [existingAnimalQuery.data, reset]);

  useEffect(() => {
    if (auth.loading || auth.profileLoading || !auth.available || auth.session) return;
    router.replace({ pathname: "/auth/login", params: { returnTo: "/animals/new" } });
  }, [auth.available, auth.loading, auth.profileLoading, auth.session]);

  if (requiresDonorProfile && (auth.loading || auth.profileLoading)) {
    return <StateMessage message="Verificando sua conta..." loading />;
  }
  if (requiresDonorProfile && !auth.session) {
    return <StateMessage message="Redirecionando para entrar..." loading />;
  }
  if (requiresDonorProfile && auth.profile?.profileType !== "doador_ong") {
    return (
      <View style={styles.accessMessage}>
        <StateMessage message="Somente perfis de doador/ONG podem publicar animais." />
        {auth.error ? <Text accessibilityRole="alert" style={styles.submitError}>{auth.error}</Text> : null}
        <Link href="/account" asChild>
          <PrimaryButton title="Ir para minha conta" variant="secondary" />
        </Link>
      </View>
    );
  }
  if (isEditing && existingAnimalQuery.isPending) {
    return <StateMessage message="Carregando anúncio para edição..." loading />;
  }
  if (isEditing && (existingAnimalQuery.error || !existingAnimalQuery.data)) {
    return <View style={styles.accessMessage}>
      <StateMessage message={`Não foi possível carregar o anúncio: ${existingAnimalQuery.error?.message ?? "anúncio não encontrado"}`} />
      <Link href="/animals/manage" asChild>
        <PrimaryButton title="Voltar aos meus anúncios" variant="secondary" />
      </Link>
    </View>;
  }

  const onSubmit = handleSubmit(async (input) => {
    setSubmitError(null);
    try {
      const { existingPhotoPaths, ...animalInput } = input;
      const animal = isEditing && animalId
        ? await updateAnimal.mutateAsync({ id: animalId, animal: animalInput, retainedPhotoPaths: existingPhotoPaths })
        : await createAnimal.mutateAsync(animalInput);
      router.replace({ pathname: "/animals/[id]", params: { id: animal.id } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível cadastrar o animal.");
    }
  });

  const selectedPhotos = watch("photos");
  const existingPhotoPaths = watch("existingPhotoPaths");
  const photoCount = selectedPhotos.length + existingPhotoPaths.length;

  async function selectPhotos() {
    setPhotoError(null);
    const remainingSlots = MAX_ANIMAL_PHOTOS - photoCount;
    if (remainingSlots <= 0) {
      setPhotoError(`Você pode adicionar no máximo ${MAX_ANIMAL_PHOTOS} fotos.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 1,
      });
      if (result.canceled) return;

      const addedPhotos = await Promise.all(result.assets.map(async (asset): Promise<AnimalPhotoInput> => ({
        uri: asset.uri,
        fileSize: asset.fileSize ?? asset.file?.size ?? await getLocalFileSize(asset.uri),
        width: asset.width,
        height: asset.height,
      })));

      if (photoCount + addedPhotos.length > MAX_ANIMAL_PHOTOS) {
        setPhotoError(`Um anúncio pode ter no máximo ${MAX_ANIMAL_PHOTOS} fotos.`);
        return;
      }
      if (addedPhotos.some((photo) => photo.fileSize > MAX_PHOTO_SIZE_BYTES)) {
        setPhotoError("Uma ou mais fotos ultrapassam 5 MB. Remova-as e selecione arquivos menores.");
        return;
      }

      setValue("photos", [...selectedPhotos, ...addedPhotos], { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Não foi possível selecionar as fotos.");
    }
  }

  function removePhoto(index: number) {
    if (index < existingPhotoPaths.length) {
      setValue("existingPhotoPaths", existingPhotoPaths.filter((_, photoIndex) => photoIndex !== index), { shouldDirty: true, shouldValidate: true });
      return;
    }
    const newPhotoIndex = index - existingPhotoPaths.length;
    setValue("photos", selectedPhotos.filter((_, photoIndex) => photoIndex !== newPhotoIndex), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? "Editar anúncio" : "Cadastrar animal" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>{isEditing ? "Atualize as informações do anúncio." : "Preencha as informações para encontrar um novo lar."}</Text>
        <Field label="Nome do animal" error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Nome do animal" onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Ex.: Mel" style={styles.input} />
            )}
          />
        </Field>

        <Field label="Espécie" error={errors.species?.message}>
          <ChoiceField control={control} name="species" options={speciesOptions} />
        </Field>

        <Field label="Raça" error={errors.breed?.message}>
          <Controller
            control={control}
            name="breed"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Raça" onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Ex.: SRD" style={styles.input} />
            )}
          />
        </Field>

        <Field label="Cidade" error={errors.city?.message}>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Cidade" onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Ex.: São Paulo" style={styles.input} />
            )}
          />
        </Field>

        <Field label="Estado (UF)" error={errors.state?.message}>
          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Estado (UF)" autoCapitalize="characters" maxLength={2} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Ex.: SP" style={styles.input} />
            )}
          />
        </Field>

        <Field label="Idade (em meses)" error={errors.ageMonths?.message}>
          <Controller
            control={control}
            name="ageMonths"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Idade em meses" keyboardType="number-pad" onBlur={onBlur} onChangeText={(text) => onChange(text === "" ? Number.NaN : Number(text))} value={Number.isNaN(value) ? "" : String(value)} placeholder="Ex.: 24" style={styles.input} />
            )}
          />
        </Field>

        <Field label="Porte" error={errors.size?.message}>
          <ChoiceField control={control} name="size" options={sizeOptions} />
        </Field>

        <Field label="Estado de saúde" error={errors.healthStatus?.message}>
          <ChoiceField control={control} name="healthStatus" options={healthOptions} />
        </Field>

        <Field label={`Fotos (${photoCount}/${MAX_ANIMAL_PHOTOS})`} error={errors.photos?.message}>
          <Text style={styles.photoHint}>Adicione pelo menos uma foto. Cada arquivo pode ter até 5 MB antes da compressão.</Text>
          <View style={styles.photoList}>
            {[...existingPhotoPaths.map((path) => ({
              key: `existing-${path}`,
              uri: existingAnimalQuery.data?.photos[existingAnimalQuery.data.photoPaths.indexOf(path)] ?? "",
            })), ...selectedPhotos.map((photo, index) => ({
              key: `new-${photo.uri}-${index}`,
              uri: photo.uri,
            }))].map((photo, index) => (
              <View key={photo.key} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover foto ${index + 1}`}
                  onPress={() => removePhoto(index)}
                  style={styles.removePhoto}
                >
                  <Text style={styles.removePhotoText}>Remover</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <PrimaryButton
            title={photoCount ? "＋  Adicionar fotos" : "＋  Selecionar fotos"}
            variant="secondary"
            onPress={() => void selectPhotos()}
            disabled={photoCount >= MAX_ANIMAL_PHOTOS || isSaving}
          />
          {photoError ? <Text accessibilityRole="alert" style={styles.error}>{photoError}</Text> : null}
        </Field>

        <Field label="Descrição" error={errors.description?.message}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Descrição do animal" multiline onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Conte um pouco sobre o animal..." style={[styles.input, styles.textarea]} textAlignVertical="top" />
            )}
          />
        </Field>

        {submitError ? <Text accessibilityRole="alert" style={styles.submitError}>{submitError}</Text> : null}
        <PrimaryButton title={isSaving ? (isEditing ? "Salvando..." : "Cadastrando...") : (isEditing ? "Salvar alterações" : "Cadastrar")} onPress={() => void onSubmit()} disabled={isSaving} />
      </ScrollView>
    </>
  );
}

async function getLocalFileSize(uri: string): Promise<number> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Não foi possível verificar o tamanho de uma foto.");
  return (await response.arrayBuffer()).byteLength;
}

type ChoiceControl = {
  control: Control<NewAnimalInput>;
  name: "species" | "size" | "healthStatus";
  options: readonly { value: string; label: string }[];
};

function ChoiceField({ control, name, options }: ChoiceControl) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={styles.choices}>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={option.value}
                onPress={() => onChange(option.value)}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    />
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 20, width: "100%", maxWidth: 680, alignSelf: "center" },
  accessMessage: { flex: 1, gap: 16, justifyContent: "center", padding: 20, width: "100%", maxWidth: 680, alignSelf: "center" },
  intro: { color: "#62596a", fontSize: 15, lineHeight: 22, marginBottom: 2 },
  field: { gap: 7 },
  label: { color: "#30283a", fontSize: 15, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, color: "#30283a", minHeight: 46, paddingHorizontal: 12 },
  textarea: { minHeight: 110, paddingTop: 12 },
  photoHint: { color: "#726a78", fontSize: 13, lineHeight: 19 },
  photoList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoItem: { alignItems: "center", gap: 6 },
  photoPreview: { backgroundColor: "#fff0dc", borderRadius: 10, height: 96, width: 96 },
  removePhoto: { padding: 6 },
  removePhotoText: { color: "#b3261e", fontSize: 13, fontWeight: "600" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { backgroundColor: "#fff", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10 },
  choiceSelected: { backgroundColor: "#f0e8ff", borderColor: "#b69bdf" },
  choiceText: { color: "#62596a" },
  choiceTextSelected: { color: "#593a8a", fontWeight: "700" },
  error: { color: "#b3261e", fontSize: 13 },
  submitError: { color: "#b3261e", lineHeight: 21 },
});
