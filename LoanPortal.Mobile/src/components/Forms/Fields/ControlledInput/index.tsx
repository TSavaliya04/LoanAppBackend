import React from "react";
import { InputBaseProps, TextField, TextFieldProps } from "@mui/material";
import {
  Control,
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTheme } from "@mui/material/styles";

type Props<T extends FieldValues> = {
  control: Control<T, unknown>;
  name: FieldPath<T>;
  errorMessage?: string;
  disabled?: boolean;
  isNumber?: boolean;
  size?: "small" | "medium";
  controllerProps?: Partial<ControllerProps<T>>;
  inputProps?: InputBaseProps["inputProps"];
  InputProps?: TextFieldProps["InputProps"];
  InputLabelProps?: TextFieldProps["InputLabelProps"];
  isLoading?: boolean;
} & TextFieldProps;

const ControlledInput = <T extends FieldValues>({
  control,
  name,
  errorMessage,
  disabled = false,
  // isLoading = false,
  // isNumber = false,
  size = "medium",
  controllerProps,
  inputProps,
  InputProps,
  InputLabelProps,
  ...rest
}: Props<T>) => {
  const theme = useTheme(); // Access the MUI theme for default colors

  return (
    <Controller
      control={control}
      name={name}
      {...controllerProps}
      render={({ field }) => (
        <TextField
          {...field}
          {...rest}
          inputProps={inputProps ? inputProps : {}}
          size={size}
          helperText={errorMessage}
          error={!!errorMessage}
          disabled={disabled}
          value={field.value ? field.value : ""}
          fullWidth
          InputProps={{
            ...InputProps,
            sx: {
              fontSize: "16px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.secondary,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.secondary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.secondary,
              },
              "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.error.main,
              },
              ...(InputProps?.sx || {}),
            },
          }}
          InputLabelProps={{
            ...InputLabelProps,
            sx: {
              fontSize: "16px",
              color: theme.palette.text.secondary,
              "&.Mui-focused": {
                fontWeight: "bold",
                color: theme.palette.text.secondary,
              },
              "&.Mui-error": {
                color: theme.palette.error.main,
              },
              ...(InputLabelProps?.sx || {}),
            },
          }}
        />
      )}
    />
  );
};

export default ControlledInput;
