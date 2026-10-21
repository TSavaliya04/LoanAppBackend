// import { SvgIcon } from "@mui/material";
import React from "react";

export const SVGLIST = {
  EditIcon: "Edit_icon",
  CheckMarkIcon: "Check_Mark_icon",
  RightArrowIcon: "Right_arrow_icon",
  CompanyEditIcon: "Company_edit_icon",
  ProfileRightArrowIcon: "Profile_Right_arrow_icon",
  ProfileEditIcon: "Profile_Edit_icon",
  ChangePassIcon: "Change_Pass_icon",
  NotificationIcon: "Notification_icon",
  LogoutIcon: "Logout_icon",
  ResetIcon: "Reset_icon",
  BorrowerInfoIcon: "Borrower_info_icon",
  PurchaseInfoIcon: "Purchase_info_icon",
  LenderFeesIcon: "Lender_fees_icon",
  PrepaidItemsIcon: "Prepaid_items_icon",
  MiscFeesIcon: "Misc_fees_icon",
  BorrowersIncomeDataIcon: "Borrowers_income_data_icon",
  DeptBreakdownIcon: "Dept_breakdown_icon",
  LoanProgramIcon: "Loan_Program_icon",
  BulbIcon: "Bulb_icon",
} as const;

export type SVGLIST = (typeof SVGLIST)[keyof typeof SVGLIST];

type Props = {
  name: SVGLIST;
} & React.SVGProps<SVGSVGElement>;

const SVGs = ({ name }: Props) => {
  if (name == SVGLIST.EditIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M13.2601 3.60022L5.0501 12.2902C4.7401 12.6202 4.4401 13.2702 4.3801 13.7202L4.0101 16.9602C3.8801 18.1302 4.7201 18.9302 5.8801 18.7302L9.1001 18.1802C9.5501 18.1002 10.1801 17.7702 10.4901 17.4302L18.7001 8.74022C20.1201 7.24022 20.7601 5.53022 18.5501 3.44022C16.3501 1.37022 14.6801 2.10022 13.2601 3.60022Z"
          stroke="#7444F5"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.8899 5.0498C12.3199 7.8098 14.5599 9.9198 17.3399 10.1998"
          stroke="#7444F5"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 22H21"
          stroke="#7444F5"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.CheckMarkIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={12}
        viewBox="0 0 14 10"
        fill="none"
      >
        <path
          d="M1 5L4.99529 9L13 1"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.RightArrowIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
      >
        <g clipPath="url(#clip0_1796_14860)">
          <path
            d="M4 12.6762H19.75"
            stroke="white"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
          <path
            d="M16.4 16.5362L19.83 13.1062C20.07 12.8662 20.07 12.4862 19.83 12.2462L16.4 8.81619"
            stroke="white"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_1796_14860">
            <rect
              width="18"
              height="9.71"
              fill="white"
              transform="translate(3 7.8262)"
            />
          </clipPath>
        </defs>
      </svg>
    );
  }
  if (name == SVGLIST.CompanyEditIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
      >
        <path
          d="M7.08775 2.57978L3.25642 6.63511C3.11175 6.78911 2.97175 7.09244 2.94375 7.30244L2.77109 8.81444C2.71042 9.36044 3.10242 9.73378 3.64375 9.64044L5.14642 9.38378C5.35642 9.34644 5.65042 9.19244 5.79508 9.03378L9.62642 4.97844C10.2891 4.27844 10.5878 3.48044 9.55642 2.50511C8.52975 1.53911 7.75042 1.87978 7.08775 2.57978Z"
          stroke="white"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.44861 3.25684C6.64928 4.54484 7.69461 5.5295 8.99194 5.66017"
          stroke="white"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.30005 11.167H10.7"
          stroke="white"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.ProfileRightArrowIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M7.42499 16.6004L12.8583 11.1671C13.5 10.5254 13.5 9.47539 12.8583 8.83372L7.42499 3.40039"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.ProfileEditIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M8.83958 2.39982L3.36624 8.19315C3.15958 8.41315 2.95958 8.84649 2.91958 9.14649L2.67291 11.3065C2.58624 12.0865 3.14624 12.6198 3.91958 12.4865L6.06624 12.1198C6.36624 12.0665 6.78624 11.8465 6.99291 11.6198L12.4662 5.82649C13.4129 4.82649 13.8396 3.68649 12.3662 2.29315C10.8996 0.913152 9.78624 1.39982 8.83958 2.39982Z"
          stroke="#1E1E1E"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.9267 3.36621C8.21336 5.20621 9.7067 6.61288 11.56 6.79954"
          stroke="#1E1E1E"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 14.667H14"
          stroke="#1E1E1E"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.ChangePassIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M4 6.66634V5.33301C4 3.12634 4.66667 1.33301 8 1.33301C11.3333 1.33301 12 3.12634 12 5.33301V6.66634"
          stroke="#1E1E1E"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.333 14.666H4.66634C1.99967 14.666 1.33301 13.9993 1.33301 11.3327V9.99935C1.33301 7.33268 1.99967 6.66602 4.66634 6.66602H11.333C13.9997 6.66602 14.6663 7.33268 14.6663 9.99935V11.3327C14.6663 13.9993 13.9997 14.666 11.333 14.666Z"
          stroke="#1E1E1E"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.6646 10.6673H10.6706"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.99666 10.6673H8.00265"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.32967 10.6663H5.33566"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.NotificationIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M8 4.29297V6.51297"
          stroke="#1E1E1E"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
        <path
          d="M8.01333 1.33301C5.55999 1.33301 3.57333 3.31967 3.57333 5.77301V7.17301C3.57333 7.62634 3.38666 8.30634 3.15333 8.69301L2.30666 10.1063C1.78666 10.9797 2.14666 11.953 3.10666 12.273C6.29333 13.333 9.73999 13.333 12.9267 12.273C13.8267 11.973 14.2133 10.9197 13.7267 10.1063L12.88 8.69301C12.6467 8.30634 12.46 7.61967 12.46 7.17301V5.77301C12.4533 3.33301 10.4533 1.33301 8.01333 1.33301Z"
          stroke="#1E1E1E"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
        <path
          d="M10.2203 12.5469C10.2203 13.7669 9.22027 14.7669 8.00027 14.7669C7.39361 14.7669 6.83361 14.5135 6.43361 14.1135C6.03361 13.7135 5.78027 13.1535 5.78027 12.5469"
          stroke="#1E1E1E"
          strokeMiterlimit="10"
        />
      </svg>
    );
  }
  if (name == SVGLIST.LogoutIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M5.93359 5.04016C6.14026 2.64016 7.37359 1.66016 10.0736 1.66016H10.1603C13.1403 1.66016 14.3336 2.85349 14.3336 5.83349V10.1802C14.3336 13.1602 13.1403 14.3535 10.1603 14.3535H10.0736C7.39359 14.3535 6.16026 13.3868 5.94026 11.0268"
          stroke="#1E1E1E"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.99975 8H2.41309"
          stroke="#1E1E1E"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.90033 5.7666L1.66699 7.99994L3.90033 10.2333"
          stroke="#1E1E1E"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.ResetIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
      </svg>
    );
  }
  if (name == SVGLIST.BorrowerInfoIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={18}
        height={22}
        viewBox="0 0 14 17"
        fill="none"
      >
        <path
          d="M10.3335 6.49984C10.3335 10.9415 3.66683 10.9415 3.66683 6.49984H5.3335C5.3335 8.72484 8.66683 8.72484 8.66683 6.49984M13.6668 13.9998V16.4998H0.333496V13.9998C0.333496 11.7748 4.77516 10.6665 7.00016 10.6665C9.22516 10.6665 13.6668 11.7748 13.6668 13.9998ZM12.0835 13.9998C12.0835 13.4665 9.47516 12.2498 7.00016 12.2498C4.52516 12.2498 1.91683 13.4665 1.91683 13.9998V14.9165H12.0835M7.41683 0.666504C7.65016 0.666504 7.8335 0.849837 7.8335 1.08317V3.58317H8.66683V1.49984C9.87516 2.05817 10.6168 3.29984 10.5418 4.62484C10.5418 4.62484 11.1252 4.7415 11.1668 5.6665H2.8335C2.8335 4.7415 3.4585 4.62484 3.4585 4.62484C3.3835 3.29984 4.12516 2.05817 5.3335 1.49984V3.58317H6.16683V1.08317C6.16683 0.849837 6.35016 0.666504 6.5835 0.666504"
          fill="#F6F6F6"
        />
      </svg>
    );
  }
  if (name == SVGLIST.PurchaseInfoIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={23}
        height={23}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5.60817 16.4165C6.2915 15.6832 7.33317 15.7415 7.93317 16.5415L8.77484 17.6665C9.44984 18.5582 10.5415 18.5582 11.2165 17.6665L12.0582 16.5415C12.6582 15.7415 13.6998 15.6832 14.3832 16.4165C15.8665 17.9998 17.0748 17.4748 17.0748 15.2582V5.8665C17.0832 2.50817 16.2998 1.6665 13.1498 1.6665H6.84984C3.69984 1.6665 2.9165 2.50817 2.9165 5.8665V15.2498C2.9165 17.4748 4.13317 17.9915 5.60817 16.4165Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.74656 9.16667H6.75405"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.08203 9.1665H13.6654"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.74656 5.83317H6.75405"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.08203 5.8335H13.6654"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.LenderFeesIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={23}
        height={23}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M7.9165 11.4585C7.9165 12.2669 8.54152 12.9169 9.30818 12.9169H10.8748C11.5415 12.9169 12.0832 12.3502 12.0832 11.6419C12.0832 10.8835 11.7498 10.6085 11.2582 10.4335L8.74984 9.55853C8.25817 9.38353 7.92485 9.11686 7.92485 8.35019C7.92485 7.65019 8.4665 7.0752 9.13316 7.0752H10.6998C11.4665 7.0752 12.0915 7.7252 12.0915 8.53353"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.25V13.75"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3332 9.99984C18.3332 14.5998 14.5998 18.3332 9.99984 18.3332C5.39984 18.3332 1.6665 14.5998 1.6665 9.99984C1.6665 5.39984 5.39984 1.6665 9.99984 1.6665"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3333 4.99984V1.6665H15"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.1665 5.83317L18.3332 1.6665"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.PrepaidItemsIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={23}
        height={23}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M3.27441 13.2327L13.2327 3.27441"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.25098 15.2324L10.251 14.2324"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.4941 12.9907L13.4858 10.999"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.00138 8.53258L8.53472 2.99925C10.3014 1.23258 11.1847 1.22425 12.9347 2.97425L17.0264 7.06591C18.7764 8.81591 18.7681 9.69925 17.0014 11.4659L11.4681 16.9992C9.70138 18.7659 8.81805 18.7742 7.06805 17.0242L2.97638 12.9326C1.22638 11.1826 1.22638 10.3076 3.00138 8.53258Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.66699 18.332H18.3337"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.MiscFeesIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={23}
        height={23}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M17.0837 9.41649V5.86651C17.0837 2.50818 16.3003 1.6665 13.1503 1.6665H6.85033C3.70033 1.6665 2.91699 2.50818 2.91699 5.86651V15.2498C2.91699 17.4665 4.13367 17.9915 5.60867 16.4082L5.61698 16.3998C6.30032 15.6748 7.34198 15.7332 7.93365 16.5248L8.77532 17.6498"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.1667 17.8333C16.6394 17.8333 17.8333 16.6394 17.8333 15.1667C17.8333 13.6939 16.6394 12.5 15.1667 12.5C13.6939 12.5 12.5 13.6939 12.5 15.1667C12.5 16.6394 13.6939 17.8333 15.1667 17.8333Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3333 18.3333L17.5 17.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66699 5.8335H13.3337"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 9.1665H12.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.BorrowersIncomeDataIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M11.8844 12.8652H7.71777"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.80176 10.8315V14.9982"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5505 2.09828L10.5255 2.15662L8.10879 7.76495H5.73379C5.16712 7.76495 4.62546 7.88162 4.13379 8.08995L5.59212 4.60662L5.62546 4.52328L5.68379 4.38995C5.70046 4.33995 5.71712 4.28995 5.74212 4.24828C6.83379 1.72328 8.06712 1.14828 10.5505 2.09828Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.0417 7.93197C14.6667 7.8153 14.2667 7.7653 13.8667 7.7653H8.1084L10.5251 2.15697L10.5501 2.09863C10.6751 2.1403 10.7917 2.19863 10.9167 2.24863L12.7584 3.02363C13.7834 3.44863 14.5001 3.8903 14.9334 4.42363C15.0167 4.52363 15.0834 4.6153 15.1417 4.72363C15.2167 4.8403 15.2751 4.95697 15.3084 5.08197C15.3417 5.15697 15.3667 5.23197 15.3834 5.29863C15.6084 5.99863 15.4751 6.85697 15.0417 7.93197Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.9351 11.8318V13.4568C17.9351 13.6235 17.9268 13.7901 17.9184 13.9568C17.7601 16.8651 16.1351 18.3318 13.0518 18.3318H6.55176C6.35176 18.3318 6.15176 18.3151 5.96009 18.2901C3.31009 18.1151 1.89342 16.6985 1.71842 14.0485C1.69342 13.8568 1.67676 13.6568 1.67676 13.4568V11.8318C1.67676 10.1568 2.69342 8.71514 4.14342 8.09014C4.64342 7.8818 5.17676 7.76514 5.74342 7.76514H13.8768C14.2851 7.76514 14.6851 7.82347 15.0518 7.9318C16.7101 8.44014 17.9351 9.99014 17.9351 11.8318Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.59199 4.60693L4.13366 8.09027C2.68366 8.71527 1.66699 10.1569 1.66699 11.8319V9.39027C1.66699 7.0236 3.35033 5.0486 5.59199 4.60693Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.9322 9.38988V11.8315C17.9322 9.99821 16.7155 8.43988 15.0488 7.93988C15.4822 6.85654 15.6072 6.00654 15.3988 5.29821C15.3822 5.22321 15.3572 5.14821 15.3238 5.08154C16.8738 5.88154 17.9322 7.52321 17.9322 9.38988Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.DeptBreakdownIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M1.66699 7.0835H11.2503"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 13.75H6.66667"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.75 13.75H12.0833"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3337 10.0248V13.4248C18.3337 16.3498 17.592 17.0832 14.6337 17.0832H5.36699C2.40866 17.0832 1.66699 16.3498 1.66699 13.4248V6.57484C1.66699 3.64984 2.40866 2.9165 5.36699 2.9165H11.2503"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.4238 6.82464L17.6572 3.59131"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17.6572 6.82464L14.4238 3.59131"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name == SVGLIST.LoanProgramIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M7.1416 12.7249L12.5916 7.2749"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.48302 8.64179C8.04911 8.64179 8.508 8.1829 8.508 7.61681C8.508 7.05071 8.04911 6.5918 7.48302 6.5918C6.91693 6.5918 6.45801 7.05071 6.45801 7.61681C6.45801 8.1829 6.91693 8.64179 7.48302 8.64179Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.9332 13.4084C13.4993 13.4084 13.9582 12.9495 13.9582 12.3834C13.9582 11.8173 13.4993 11.3584 12.9332 11.3584C12.3671 11.3584 11.9082 11.8173 11.9082 12.3834C11.9082 12.9495 12.3671 13.4084 12.9332 13.4084Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.0003 18.3332C14.6027 18.3332 18.3337 14.6022 18.3337 9.99984C18.3337 5.39746 14.6027 1.6665 10.0003 1.6665C5.39795 1.6665 1.66699 5.39746 1.66699 9.99984C1.66699 14.6022 5.39795 18.3332 10.0003 18.3332Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name == SVGLIST.BulbIcon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 2.62 1.41 4.91 3.5 6.19V17c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-1.81C17.59 13.91 19 11.62 19 9c0-3.87-3.13-7-7-7zm2 14h-4v-1h4v1zm-4 2h4v1h-4v-1z"
          fill="#d97706"
        />
        <circle cx="12" cy="9" r="3" fill="#fbbf24" opacity="0.5" />
      </svg>
    );
  }

  return <></>;
};

export default SVGs;
