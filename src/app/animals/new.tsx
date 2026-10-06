import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack } from "expo-router";
import { Controller, useForm, type Control } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { newAnimalSchema, type NewAnimalInput } from "@/features/animals/schemas/animal.schema";
import { useCreateAnimal } from "@/features/animals/hooks/useAnimals";
import type { AnimalHealth, AnimalSize, AnimalSpecies } from "@/features/animals/types";

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
  const createAnimal = useCreateAnimal();
  const { control, handleSubmit, formState: { errors } } = useForm<NewAnimalInput>({
    resolver: zodResolver(newAnimalSchema),
    defaultValues: {
      name: "",
      species: "cachorro",
      breed: "",
      ageMonths: 0,
      size: "medio",
      healthStatus: "nao_informado",
      description: "",
    },
  });

  const onSubmit = handleSubmit(async (input) => {
    const animal = await createAnimal.mutateAsync(input);
    router.replace({ pathname: "/animals/[id]", params: { id: animal.id } });
  });

  return (
    <>
      <Stack.Screen options={{ title: "Cadastrar animal" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Preencha as informações para encontrar um novo lar.</Text>
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

        <Field label="Descrição" error={errors.description?.message}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput accessibilityLabel="Descrição do animal" multiline onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Conte um pouco sobre o animal..." style={[styles.input, styles.textarea]} textAlignVertical="top" />
            )}
          />
        </Field>

        {createAnimal.error ? <Text accessibilityRole="alert" style={styles.submitError}>{createAnimal.error.message}</Text> : null}
        <PrimaryButton title={createAnimal.isPending ? "Cadastrando..." : "Cadastrar"} onPress={() => void onSubmit()} disabled={createAnimal.isPending} />
      </ScrollView>
    </>
  );
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
  intro: { color: "#62596a", fontSize: 15, lineHeight: 22, marginBottom: 2 },
  field: { gap: 7 },
  label: { color: "#30283a", fontSize: 15, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, color: "#30283a", minHeight: 46, paddingHorizontal: 12 },
  textarea: { minHeight: 110, paddingTop: 12 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { backgroundColor: "#fff", borderColor: "#e5dce9", borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10 },
  choiceSelected: { backgroundColor: "#f0e8ff", borderColor: "#b69bdf" },
  choiceText: { color: "#62596a" },
  choiceTextSelected: { color: "#593a8a", fontWeight: "700" },
  error: { color: "#b3261e", fontSize: 13 },
  submitError: { color: "#b3261e", lineHeight: 21 },
});
