import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Field, Form, Formik, FieldArray } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import React, { Children, useState } from "react";
import { mixed, number, object, array, string } from "yup";

const useStyles = makeStyles((theme) => ({
  errorColor: {
    color: theme.palette.error.main,
  },
  noWrap: {
    [theme.breakpoints.up("sm")]: {
      flexWrap: "nowrap",
    },
  },
}));

const sleep = (time) => new Promise((acc) => setTimeout(acc, time));

const emptyDonation = { institution: "", percentage: 0 };

export default function Home() {
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState(0);
  const classes = useStyles();

  const checkStepForward = () => {
    if (step < steps.length - 1 && step >= 0) {
      setStep((s) => s + 1);
    }
  };

  const checkStepBackward = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const checkLastStep = () => {
    if (step === steps.length - 1) {
      setCompleted(true);
    }
  };

  const steps = ["Personal Data", "Add Donation", "Bank Accounts", "More Info"];
  return (
    <Card>
      <CardContent>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            millionaire: false,
            money: 0,
            description: "",
            donations: [emptyDonation],
          }}
          onSubmit={async (values, helpers) => {
            await sleep(3000);
            console.log(values);
            helpers.setTouched({});
          }}
          validationSchema={object({
            money: mixed().when("millionaire", {
              is: true,
              then: number()
                .required()
                .min(
                  1_000_000,
                  "Because you said you are a millionaire you need to have 1 million"
                ),
              otherwise: number().required(),
            }),
            donations: array(
              object({
                institution: string()
                  .required("Institution name needed")
                  .min(3, "Institution name needs to be at least 3 characters")
                  .max(
                    10,
                    "Institution name needs to be at most 10 characters"
                  ),
                percentage: number()
                  .required("Percentage needed")
                  .min(1, "Percentage needs to be at least 1%")
                  .max(100, "Percentage can be at most 100%"),
              })
            )
              .min(1, "You need to provide at least 1 institution")
              .max(3, "You can only provide 3 institution"),
          })}
        >
          {({ values, errors, isSubmitting }) => (
            <Form autoComplete="off">
              <Stepper alternativeLabel activeStep={step}>
                {steps.map((label, index) => (
                  <Step key={label} completed={step > index || completed}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {step === 0 && (
                <Box>
                  <Box paddingBottom={2}>
                    <Field
                      fullWidth
                      name="firstName"
                      component={TextField}
                      label="First Name"
                    />
                  </Box>

                  <Box paddingBottom={2}>
                    <Field
                      fullWidth
                      name="lastName"
                      component={TextField}
                      label="Last Name"
                    />
                  </Box>

                  <Box paddingBottom={2}>
                    <Field
                      name="millionaire"
                      type="checkbox"
                      component={CheckboxWithLabel}
                      Label={{ label: "I am a millionare" }}
                    />
                  </Box>
                </Box>
              )}

              {step === 1 && (
                <Box>
                  <FieldArray name="donations">
                    {({ push, remove }) => (
                      <React.Fragment>
                        <Grid item>
                          <Typography variant="body2">
                            All your donations
                          </Typography>
                        </Grid>

                        {values.donations.map((_, index) => (
                          <Grid
                            container
                            item
                            className={classes.noWrap}
                            key={index}
                            spacing={2}
                          >
                            <Grid item container spacing={2} xs={12} sm="auto">
                              <Grid item xs={12} sm={6}>
                                <Field
                                  fullWidth
                                  name={`donations.${index}.institution`}
                                  component={TextField}
                                  label="Institution"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Field
                                  fullWidth
                                  name={`donations[${index}].percentage`}
                                  component={TextField}
                                  type="number"
                                  label="Percentage (%)"
                                />
                              </Grid>
                            </Grid>
                            <Grid item xs={12} sm="auto">
                              <Button
                                disabled={isSubmitting}
                                onClick={() => remove(index)}
                              >
                                Delete
                              </Button>
                            </Grid>
                          </Grid>
                        ))}

                        <Grid item>
                          {typeof errors.donations === "string" ? (
                            <Typography color="error">
                              {errors.donations}
                            </Typography>
                          ) : null}
                        </Grid>

                        <Grid item>
                          <Button
                            disabled={isSubmitting}
                            variant="contained"
                            onClick={() => push(emptyDonation)}
                          >
                            Add Donation
                          </Button>
                        </Grid>
                      </React.Fragment>
                    )}
                  </FieldArray>
                </Box>
              )}

              {step === 2 && (
                <Box>
                  <Box paddingBottom={2}>
                    <Field
                      fullWidth
                      name="money"
                      type="number"
                      component={TextField}
                      label="All the money I have"
                    />
                  </Box>
                </Box>
              )}

              {step === 3 && (
                <Box>
                  <Box paddingBottom={2}>
                    <Field
                      fullWidth
                      name="description"
                      component={TextField}
                      label="Description"
                    />
                  </Box>
                </Box>
              )}

              <Grid container spacing={2}>
                {step > 0 ? (
                  <Grid item>
                    <Button
                      disabled={isSubmitting}
                      variant="contained"
                      color="primary"
                      onClick={checkStepBackward}
                    >
                      Back
                    </Button>
                  </Grid>
                ) : null}

                <Grid item>
                  {step !== steps.length - 1 && (
                    <Button
                      disabled={isSubmitting}
                      variant="contained"
                      color="primary"
                      type="button"
                      onClick={checkStepForward}
                    >
                      Next
                    </Button>
                  )}

                  {step === steps.length - 1 && (
                    <Button
                      startIcon={
                        isSubmitting ? <CircularProgress size="1rem" /> : null
                      }
                      disabled={isSubmitting}
                      variant="contained"
                      color="primary"
                      type="submit"
                      onClick={checkLastStep}
                    >
                      Submit
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
