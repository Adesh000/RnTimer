import { FC } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { FormInputProps } from '../../utils';

export const FormInput: FC<FormInputProps> = ({
  title,
  value,
  setValue,
  placeholder,
}) => {
  return (
    <>
      <Text style={styles.label}>{title}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
});
