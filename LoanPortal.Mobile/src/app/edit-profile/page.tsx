"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  CircularProgress,
  TextField,
  Avatar,
} from "@mui/material";
import {
  Search,
  Info,
  Menu,
  Home,
  Description,
  CalendarToday,
  QuestionAnswer,
  Person,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import CheckIcon from '@mui/icons-material/Check';
// import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
// import { firebaseAuth } from "@/api/instances/firebase";
// import { signOut } from "@firebase/auth";
// import { useSessionStore } from "@/stores/SessionStore";
import {
  Controller,
  FormProvider,
  useForm,
  // useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProfileFormData,
  ProfileFormPayloadData,
  profileSchema,
} from "@/api/models/ProfileFormTypes";
import { MuiTelInput } from "mui-tel-input";
import theme from "@/styles/mui/theme";
import {
  useCreateProfile,
  useGetProfile,
} from "@/api/reactQueriesHooks/useProfile";
// import EditIcon from "@mui/icons-material/Edit";
import SVGs from "@/components/SVGs";
import CustomSnackBar from "@/components/CustomSnackBar";
import { useSnackBarStore } from "@/store/SnackBarStore";
import BottomNavbar from "@/components/Common/BottomNavbar";
import { CompanyOption } from "@/api/models/user";

const EditProfile = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const { openSuccessDialog } = useSnackBarStore();
  const [issaved, setIssaved] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "/default-avatar.png", // default or API-provided avatar
  );
  const { data: fetchedData } = useGetProfile();
  const [isloading, setIsloading] = useState(false);
  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      nmls: undefined,
      phone: "",
      email: "",
      companyId: "",
    },
  });

  const {
    control,
    setValue,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  useEffect(() => {
    console.log(fetchedData);
    if (fetchedData) {
      const profileData = fetchedData.data;
      methods.reset({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        jobTitle: profileData.jobTitle,
        nmls: Number(profileData.nmls),
        phone: profileData.phone,
        email: profileData.email,
        companyId: profileData.companyId ?? "",
      });
      // Pre-populate the company autocomplete display label if we have a name
      if (profileData.companyId && profileData.companyName) {
        setSelectedCompany({ id: profileData.companyId, name: profileData.companyName });
        setCompanySearchText(profileData.companyName);
      }
      if (profileData.profile) {
        setAvatarUrl(profileData.profile);
      }
      setIssaved(true);
    }
  }, [fetchedData, methods]);

  // const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(3);

  const { mutateAsync: submitProfile } = useCreateProfile();

  // Company search state
  const [companySearchText, setCompanySearchText] = useState("");
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const naCompanyIdRef = useRef<string>("");

  const fetchCompanies = useCallback(async (searchText: string) => {
    if (!searchText.trim()) {
      // setCompanyOptions([]);
      // return;
      searchText = "N/A";
    }
    setCompanyLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}admin/GetCompanies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            params: {
              pageNumber: 0,
              pageSize: 0,
              searchText,
              sortBy: "",
              sortByDirection: "",
            },
          }),
        }
      );
      if (response.ok) {
        const json = await response.json();
        const list: CompanyOption[] = json?.data?.companies ?? [];
        setCompanyOptions(list);
      }
    } catch {
      setCompanyOptions([]);
    } finally {
      setCompanyLoading(false);
    }
  }, []);

  // On mount: fetch companies and pre-select the "N/A" company as default
  useEffect(() => {
    const fetchDefaultCompany = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}admin/GetCompanies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              params: {
                pageNumber: 0,
                pageSize: 0,
                searchText: "N/A",
                sortBy: "",
                sortByDirection: "",
              },
            }),
          }
        );
        if (response.ok) {
          const json = await response.json();
          const list: CompanyOption[] = json?.data?.companies ?? [];
          const naCompany = list.find(
            (c) => c.name.trim().toLowerCase() === "n/a"
          );
          if (naCompany) {
            naCompanyIdRef.current = naCompany.id;
            setSelectedCompany(naCompany);
            setCompanySearchText(naCompany.name);
            setValue("companyId", naCompany.id);
          }
        }
      } catch {
        // Silently ignore — company field is optional
      }
    };
    fetchDefaultCompany();
  }, [setValue]);

  const handleCompanyInputChange = (
    value: string,
    onChange: (val: string) => void
  ) => {
    setCompanySearchText(value);
    setSelectedCompany(null);
    onChange("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchCompanies(value);
    }, 400);
  };

  const handleCreateSuccess = () => {
    openSuccessDialog("Profile updated successfully.");
  };

  const handleSubmitForm = async () => {
    const { firstName, lastName, jobTitle, nmls, phone, email, companyId } =
      methods.getValues();

    const isValid = await methods.trigger();
    if (!isValid) return;

    setIsloading(true);

    const payload: ProfileFormPayloadData = {
      FirstName: firstName,
      LastName: lastName,
      JobTitle: jobTitle,
      NMLS: nmls,
      Phone: phone,
      Email: email,
      CompanyId: companyId || naCompanyIdRef.current || "0",
      Profile: selectedFile ?? undefined,
    };

    try {
      const response = await submitProfile(payload);

      // Reset form values and clear dirty state
      methods.reset(methods.getValues());

      setIssaved(true);
      handleCreateSuccess();

      console.log("response =>", response);
    } finally {
      setIsloading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click
  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarUrl(URL.createObjectURL(file)); // preview
    }
  };

  const onPhoneChange = (
    formattedValue: string,
    onChange: (value: string) => void,
  ) => {
    const digitsOnly = formattedValue.replace(/\D/g, "");
    onChange(digitsOnly);
  };

  return (
    <ProtectedRoute allow={["user"]}>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "white",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  width={32}
                  height={32}
                  src={"/icons/icon-192x192.png"}
                  alt="Logo"
                />
              </Box>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: "1.6rem",
                  fontWeight: 400,
                }}
                component="div" // <-- Change from <p> to <div>
              >
                <Typography
                  sx={{
                    display: "inline-block",
                    color: "primary.main",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                  }}
                  component="span" // <-- Inline element
                >
                  Loans
                </Typography>{" "}
                N Stuff
              </Typography>
            </Box>
            {/* <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "text.secondary" }}>
                <Search />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Info />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Menu />
              </IconButton>
            </Box> */}
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <CustomSnackBar
            open={openSnackBar}
            onClose={closeDialog}
            severity={severity}
            errorMessage={message}
          ></CustomSnackBar>
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitForm();
              }}
            >
              <Box maxWidth={420} mx="auto" bgcolor="#fbeac8" minHeight="100vh">
                <Box
                  sx={{
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    pt: "20px",
                    px: "15px",
                    pb: "15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "15px",
                  }}
                >
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    {/* Avatar */}
                    <Avatar
                      src={avatarUrl}
                      alt="Profile"
                      sx={{ width: 80, height: 80 }}
                    />

                    {/* Edit Button */}
                    <Box
                      onClick={handleEditClick}
                      sx={{
                        width: "21px",
                        height: "21px",
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "100%",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": { backgroundColor: "error.dark" },
                      }}
                    >
                      <SVGs name={"Company_edit_icon"} fill="white" />
                    </Box>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#888888",
                      lineHeight: "14px",
                      marginTop: "12px",
                    }}
                  >
                    Upload/Change Company Logo
                  </Typography>
                </Box>
                <Box
                  sx={{
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    p: "20px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name *"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name *"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                    <Controller
                      name="jobTitle"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Job Title *"
                          error={!!errors.jobTitle}
                          helperText={errors.jobTitle?.message}
                        />
                      )}
                    />
                    <Controller
                      name="nmls"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          value={field.value ?? ""}
                          fullWidth
                          label="NMLS # *"
                          type="number"
                          inputMode="numeric"
                          error={!!errors.nmls}
                          helperText={errors.nmls?.message}
                        />
                      )}
                    />
                    <Controller
                      name="phone"
                      control={control}
                      render={({
                        field: {
                          ref: fieldRef,
                          value,
                          onChange,
                          ...fieldProps
                        },
                        fieldState,
                      }) => (
                        <MuiTelInput
                          forceCallingCode
                          {...fieldProps}
                          label="Phone"
                          value={value ? `+${value}` : ""}
                          inputRef={fieldRef}
                          onlyCountries={["US", "IN"]}
                          defaultCountry="US"
                          onChange={(value) => onPhoneChange(value, onChange)}
                          helperText={
                            fieldState.error ? fieldState.error.message : ""
                          }
                          error={!!fieldState.error}
                          sx={{
                            width: "100%",
                            fontSize: "16px",
                            "& .MuiOutlinedInput-root": {
                              borderColor: "#555555",
                            },
                            "&:hover .MuiOutlinedInput-root": {
                              borderColor: "#888888",
                            },
                            "&.Mui-focused .MuiOutlinedInput-root": {
                              borderColor: "#555555",
                            },
                            "&.Mui-error .MuiOutlinedInput-root": {
                              borderColor: theme.palette.error.main,
                            },
                            "& .MuiInputLabel-root": {
                              fontSize: "16px",
                              color: "#555555",
                              "&.Mui-focused": {
                                fontWeight: "bold",
                                color: "#555555",
                              },
                              "&.Mui-error": {
                                color: theme.palette.error.main,
                              },
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          disabled
                          label="Email *"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                    <Controller
                      name="companyId"
                      control={control}
                      render={({ field: { onChange }, fieldState }) => (
                        <Autocomplete
                          options={companyOptions}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          loading={companyLoading}
                          value={selectedCompany}
                          inputValue={companySearchText}
                          filterOptions={(x) => x}
                          onInputChange={(_e, value, reason) => {
                            if (reason === "input") {
                              handleCompanyInputChange(value, onChange);
                            }
                          }}
                          onChange={(_e, value) => {
                            setSelectedCompany(value);
                            setCompanySearchText(value?.name ?? "");
                            onChange(value?.id ?? "");
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Current Company *"
                              variant="outlined"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {companyLoading ? (
                                      <CircularProgress color="inherit" size={18} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      )}
                    />
                    <Button
                      disabled={isloading}
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{ bgcolor: isDirty || !issaved ? "#ff453b" : "#1F9A00", borderRadius: 99, py: 1.25 }}
                    >
                      {isloading ? (
                        <CircularProgress size={24} sx={{ color: "#ff453b" }} />
                      ) : !isDirty && issaved ? (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography fontWeight={400} color="white">
                            SAVED
                          </Typography>
                          <CheckIcon fontSize="small" sx={{ color: "white" }} />
                        </Box>
                      ) : (
                        <Typography fontWeight={400} color="white">
                          SAVE
                        </Typography>
                      )}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </form>
          </FormProvider>
          {/* <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button> */}
        </Container>

        <BottomNavbar selectedTab={selectedTab} />
      </Box>
    </ProtectedRoute>
  );
};

export default EditProfile;
