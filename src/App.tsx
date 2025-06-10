import styles from "./App.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import clsx from "clsx";

// Допустимые символы для аминокислот
const AMINO_REGEX = /^[ARNDCEQGHILKMFPSTWYV-]+$/i;

const COLOR_MAP: Record<string, string> = {
  A: "#67E4a9",
  R: "#bb99ff",
  N: "#80bfff",
  D: "#fc9cac",
  C: "#FFEA00",
  Q: "#80bfff",
  E: "#fc9cac",
  G: "#C4C4C4",
  H: "#80bfff",
  I: "#67E4a9",
  L: "#67E4a9",
  K: "#bb99ff",
  M: "#67E4a9",
  F: "#67E4a9",
  P: "#67E4a9",
  S: "#80bfff",
  T: "#80bfff",
  W: "#67E4a9",
  Y: "#67E4a9",
  V: "#67E4a9",
  "-": "",
};

interface IForm {
  AMK1: string;
  AMK2: string;
}

export default function App() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IForm>({ mode: "onChange" });
  const [sequences, setSequences] = useState<IForm | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const onSubmit = (data: IForm) => {
    setSequences(data);
  };

  const handleCopy = (e: React.MouseEvent) => {
    const selection = window.getSelection()?.toString();
    if (selection && AMINO_REGEX.test(selection)) {
      navigator.clipboard.writeText(selection);
      setSnackbarOpen(true);
    }
  };

  const validate = {
    required: "Обязательное поле",
    pattern: {
      value: AMINO_REGEX,
      message: "Допустимы только символы A, R, N, D, ... и -",
    },
    validate: (val: string) => {
      const other = watch("AMK1") || watch("AMK2");
      if (other && val.length !== other.length) {
        return "Последовательности должны быть одинаковой длины";
      }
      return true;
    },
  };
  const chunkSize = 50;

  const getChunks = (str: string) =>
    str.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];

  return (
    <main className={styles.main} onMouseUp={handleCopy}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.form__inputs}>
          <TextField
            {...register("AMK1", validate)}
            label="АМК1"
            variant="standard"
            error={!!errors.AMK1}
            helperText={errors.AMK1?.message}
          />
          <TextField
            {...register("AMK2", validate)}
            label="АМК2"
            variant="standard"
            error={!!errors.AMK2}
            helperText={errors.AMK2?.message}
          />
        </div>
        <Button type="submit" variant="contained">
          Визуализировать
        </Button>
      </form>

      {sequences &&
        (() => {
          const chunks1 = getChunks(sequences.AMK1);
          const chunks2 = getChunks(sequences.AMK2);
          return (
            <div className={styles.result}>
              <div className={styles.sequenceBlock}>
                {chunks1.map((chunk, i) => (
                  <div key={i} className={styles.linePair}>
                    <div className={styles.sequenceLine}>
                      {chunk.split("").map((char, j) => (
                        <span
                          key={j}
                          style={{
                            backgroundColor:
                              COLOR_MAP[char.toUpperCase()] || "#fff",
                          }}
                          className={styles.letter}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <div className={styles.sequenceLine}>
                      {chunks2[i]?.split("").map((char, j) => (
                        <span
                          key={j}
                          className={clsx(styles.letter, {
                            [styles.diff]:
                              char.toUpperCase() !== chunk[j]?.toUpperCase(),
                          })}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        message="Скопировано в буфер"
        onClose={() => setSnackbarOpen(false)}
      />
    </main>
  );
}
