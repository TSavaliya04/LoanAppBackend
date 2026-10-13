import React, { useMemo } from "react";
import { GridColDef, GridEventListener } from "@mui/x-data-grid";
import { Chip, Stack, Typography } from "@mui/material";

import { useGetAllUsers } from "@/api/reactQueriesHooks/useGetUserDetails";
// import CassavaAvtar from "@/components/Avatar/CassavaAvatar";
// import useDataLoader from "./useDataLoader";
import theme from "@/styles/mui/theme";
import { useRouter } from "next/navigation";

const UserListLogic = () => {
  const router = useRouter();
  const { isLoading: isLoadingUserData, data, refetch } = useGetAllUsers();

  // const { isLoadingUserDropDown } = useDataLoader();

  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowCountState, setRowCountState] = React.useState(
    data?.totalCount || 0
  );

  const columns: GridColDef[] = React.useMemo(
    () => [
      // {
      //   field: "profilePicture",
      //   headerName: "Avatar",
      //   flex: 0.5,
      //   align: "left",
      //   editable: false,
      //   sortable: false,
      //   filterable: false,
      //   hideable: false,
      //   renderCell: (params) => {
      //     return (
      //       <CassavaAvtar
      //         quality={20}
      //         imagePath={params.value}
      //         displayname={params.row.displayName}
      //         sx={{
      //           width: "40px",
      //           height: "40px",
      //           borderRadius: "50%",
      //           fontSize: "16px",
      //         }}
      //       />
      //     );
      //   },
      // },
      {
        field: "agentName",
        headerName: "Agent Name",
        flex: 1,
        editable: false,
        filterable: false,
        sortable: true,
      },
      {
        field: "company",
        headerName: "Company",
        flex: 1,
        editable: false,
        filterable: false,
        sortable: true,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        editable: false,
        filterable: false,
        sortable: true,
      },
      {
        field: "lastLogin",
        headerName: "Last Login",
        flex: 1,
        editable: false,
        filterable: false,
        sortable: true,
      },
      {
        field: "quotesThisWeek",
        headerName: "Quotes This Week",
        flex: 1,
        editable: false,
        filterable: false,
        sortable: true,
      },
      // {
      //   field: "status",
      //   headerName: "Status",
      //   flex: 1,
      //   editable: false,
      //   filterable: false,
      //   sortable: true,
      // },
      // {
      //   field: "phone",
      //   headerName: "Phone Number",
      //   flex: 1.5,
      //   editable: false,
      //   filterable: false,
      //   sortable: true,
      //   renderCell: (params) => {
      //     //let firstPart = params.value.substring(0, 1);
      //     var secondPart = params.value.slice(-10);
      //     const phone = `${secondPart}`;
      //     return (<Typography title={phone} sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>{secondPart}</Typography>);
      //   },
      // },
      // {
      //   field: "isSatVolunteer",
      //   headerName: "Interview Volunteer",
      //   flex: 1,
      //   editable: false,
      //   sortable: true,
      //   filterable: false,
      //   hideable: false,
      //   align: "left",
      //   renderCell: (params) => {
      //     if (!params.row.isSatVolunteer && !params.row.isSunVolunteer) {
      //       return (
      //         <Chip
      //           label="Not Available"
      //           sx={{
      //             background: theme.palette.action.hover,
      //             color: theme.palette.text.secondary,
      //           }}
      //         />
      //       );
      //     } else if (params.row.isSatVolunteer && params.row.isSunVolunteer) {
      //       return (
      //         <Stack direction={"row"} flexWrap={"wrap"} gap={1}>
      //           <Chip
      //             label="Sunday"
      //             sx={{
      //               background: "rgba(33, 150, 243, 0.08);",
      //               color: "#2196F3",
      //             }}
      //           />
      //           <Chip
      //             label="Saturday"
      //             sx={{
      //               background: "rgba(33, 150, 243, 0.08);",
      //               color: "#2196F3",
      //             }}
      //           />
      //         </Stack>
      //       );
      //     } else if (params.row.isSatVolunteer) {
      //       return (
      //         <Chip
      //           label="Saturday"
      //           sx={{
      //             background: "rgba(33, 150, 243, 0.08);",
      //             color: "#2196F3",
      //           }}
      //         />
      //       );
      //     } else if (params.row.isSunVolunteer) {
      //       return (
      //         <Chip
      //           label="Sunday"
      //           sx={{
      //             background: "rgba(33, 150, 243, 0.08);",
      //             color: "#2196F3",
      //           }}
      //         />
      //       );
      //     }
      //   },
      // },
      // {
      //   field: "roleName",
      //   headerName: "Role",
      //   flex: 1,
      //   editable: false,
      //   filterable: false,
      //   sortable: true,
      // },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (params) => {
          return (
            <Stack sx={{ flexDirection: "row", paddingLeft: "10px", paddingRight: "10px", paddingTop: "4px", paddingBottom: "4px", borderRadius: 80, border: '1px #DCDCDC solid', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', gap: "8px" }}>
              <Typography sx={{ width: 8, height: 8, background: `${(params.value === "Active") ? '#41BF2D' : 'red'}`, borderRadius: 9999 }}></Typography>
              <Typography sx={{ fontSize: "13px", color: "#555555" }}>
                {params.value ? params.value : '-'}
              </Typography>
            </Stack>
          );
        },
      },
    ],
    []
  );

  // const handleRewards = (e: React.SyntheticEvent) => {
  //   e.stopPropagation();
  //   router.push(`rewards/tc-points`)
  // }

  const handleEvent: GridEventListener<"rowClick"> = (params) => {
    router.push(`/admin/user/${params.row.agentId}`);
  };

  useMemo(() => {
    setRowCountState((prevRowCountState) =>
      data?.totalCount !== undefined ? data?.totalCount : prevRowCountState
    );
  }, [data?.totalCount, setRowCountState]);


  return {
    rowCountState,
    columns,
    data,
    // isLoading: isLoadingUserData || isLoadingUserDropDown,
    isLoading: isLoadingUserData,
    handleEvent,
  } as const;
};

export default UserListLogic;
