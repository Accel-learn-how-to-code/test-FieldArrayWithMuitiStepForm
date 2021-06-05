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
import {
  Field,
  Form,
  Formik,
  FormikConfig,
  FormikValues,
  FieldArray,
  useFormik,
} from "formik";
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
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      millionaire: false,
      money: 0,
      description: "",
      donations: [emptyDonation],
    },
    onSubmit: async (values) => {},
  });

  const [refresh, setRefresh] = useState(false);
  const classes = useStyles();
  return (
    <Card>
      <CardContent>
        <FormikStepper
          initialValues={formik.initialValues}
          onSubmit={async (values) => {
            await sleep(3000);
            console.log(values);
          }}
        >
          <FormikStep label="Personal Data">
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
          </FormikStep>

          <FormikStep
            label="Add Donation"
            validationSchema={object({
              donations: array(
                object({
                  institution: string()
                    .required("Institution name needed")
                    .min(
                      3,
                      "Institution name needs to be at least 3 characters"
                    )
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
            <FieldArray name="donations">
              {({ push, remove }) => (
                <React.Fragment>
                  <Grid item>
                    <Typography variant="body2">All your donations</Typography>
                  </Grid>

                  {formik.values.donations.map((_, index) => (
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
                          disabled={formik.isSubmitting}
                          onClick={() => remove(index)}

                          //onClick={() => {
                          // formik.setValues({
                          //   ...formik.values,
                          //   donations: newArr,
                          //   // ...formik.values.donations.slice(0, index),
                          //   // ...formik.values.donations.slice(index + 1),
                          // });
                          //}}
                        >
                          Delete
                        </Button>
                      </Grid>
                    </Grid>
                  ))}

                  <Grid item>
                    {typeof formik.errors.donations === "string" ? (
                      <Typography color="error">
                        {formik.errors.donations}
                      </Typography>
                    ) : null}
                  </Grid>

                  <Grid item>
                    <Button
                      disabled={formik.isSubmitting}
                      variant="contained"
                      onClick={() => push(emptyDonation)}

                      // onClick={() => {
                      //   formik.setValues({
                      //     ...formik.values,
                      //     donations: [
                      //       ...formik.values.donations,
                      //       emptyDonation,
                      //     ],
                      //   });
                      // }}
                    >
                      Add Donation
                    </Button>
                  </Grid>
                </React.Fragment>
              )}
            </FieldArray>
          </FormikStep>

          <FormikStep
            label="Bank Accounts"
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
            })}
          >
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="money"
                type="number"
                component={TextField}
                label="All the money I have"
              />
            </Box>
          </FormikStep>
          <FormikStep label="More Info">
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="description"
                component={TextField}
                label="Description"
              />
            </Box>
          </FormikStep>
        </FormikStepper>
      </CardContent>
    </Card>
  );
}

export interface FormikStepProps
  extends Pick<FormikConfig<FormikValues>, "children" | "validationSchema"> {
  label: string;
}

export function FormikStep({ children }: FormikStepProps) {
  return <>{children}</>;
}

export function FormikStepper({
  children,
  ...props
}: FormikConfig<FormikValues>) {
  const childrenArray = React.Children.toArray(
    children
  ) as React.ReactElement<FormikStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);

  const isLastStep = () => {
    return step === childrenArray.length - 1;
  };

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
          helpers.setTouched({});
        } else {
          setStep((s) => s + 1);
        }
      }}
    >
      {({ values, errors, isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step
                key={child.props.label}
                completed={step > index || completed}
              >
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {currentChild}

          <Grid container spacing={2}>
            {step > 0 ? (
              <Grid item>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              </Grid>
            ) : null}

            <Grid item>
              <Button
                startIcon={
                  isSubmitting ? <CircularProgress size="1rem" /> : null
                }
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {isSubmitting ? "Submiting" : isLastStep() ? "Submit" : "Next"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
