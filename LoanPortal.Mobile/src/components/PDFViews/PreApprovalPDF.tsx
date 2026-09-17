import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import ntmrLogo from "../../../public/icons/icon-144x144.png"; // Adjust based on your image location

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: {
    width: "100%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    width: "100%",
  },
  cellValueBold: {
    fontWeight: "bold",
  },
  cell: {
    width: "25%",
    fontSize: 10,
    textAlign: "left",
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  lastCellInRow: {
    borderRightWidth: 0, // remove right border from last cell in row
  },
  cellKey: {
    width: "25%",
    fontWeight: "bold",
    fontSize: 10,
  },
  cellValue: {
    width: "25%",
    fontSize: 10,
  },
  section: {
    marginBottom: 10,
  },
  cellRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #ccc",
    paddingBottom: 4,
    marginBottom: 4,
  },
  signature: {
    position: "absolute",
    bottom: 30,
    left: 30,
  },
});

type Borrowers = {
  name: string;
};

type PreApprovalPDFProps = {
  borrowerName: string;
  borrowers: Borrowers[];
  date: string;
  downPaymentAmount: string;
  downPaymentPercentage: string;
  firstMortgageAmount: string;
  lendingCompany: string;
  loanProgram: string;
  propertyType: string;
  purchasePrice: string;
  occupancyStatus: string;
  address: string;
  loanUse: string;
  unitCount: string;
  ppp: string;
};

export const PreApprovalPDF = ({ data }: { data: PreApprovalPDFProps }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.row}>
        <Text>Date: {data.date}</Text>
        <Image src={ntmrLogo.src} style={{ width: 100 }} />
      </View>

      <Text>Borrower(s): {data.borrowers.join(", ")}</Text>
      <Text>Address: {data.address}</Text>
      <Text style={{ marginBottom: 10 }}>
        Dear {data.borrowerName || "Sir/Madam"},
      </Text>

      <Text style={styles.section}>
        Based on the information you provided to us and a preliminary review of
        your credit history, income, and assets, NTMR Holdings, Inc. finds you
        to be pre-approved for a mortgage loan, up to the terms and amounts
        listed as follows:
      </Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>Pre-Approval Date:</Text>
          <Text style={[styles.cell, styles.cellValueBold]}>{data.date}</Text>
          <Text style={styles.cell}>Purchase Price:</Text>
          <Text
            style={[styles.cell, styles.cellValueBold, styles.lastCellInRow]}
          >
            ${data.purchasePrice}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>Loan Use:</Text>
          <Text style={[styles.cell, styles.cellValueBold]}>
            {data.loanUse}
          </Text>
          <Text style={styles.cell}>Loan Program:</Text>
          <Text
            style={[styles.cell, styles.cellValueBold, styles.lastCellInRow]}
          >
            {data.loanProgram}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>1st Mortgage Amount:</Text>
          <Text style={[styles.cell, styles.cellValueBold]}>
            ${data.firstMortgageAmount}
          </Text>
          <Text style={styles.cell}>Property Use:</Text>
          <Text
            style={[styles.cell, styles.cellValueBold, styles.lastCellInRow]}
          >
            {data.occupancyStatus}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>Down Payment:</Text>
          <Text style={[styles.cell, styles.cellValueBold]}>
            ${data.downPaymentAmount}             {data.downPaymentPercentage}%
          </Text>
          <Text style={styles.cell}>Property Type:</Text>
          <Text
            style={[styles.cell, styles.cellValueBold, styles.lastCellInRow]}
          >
            {data.propertyType}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>
        This Pre-Approval is subject to the verification of all information
        provided by you, including, but not limited to, a satisfactory appraisal
        of the subject property, a satisfactory title search and a final
        underwriting decision.
      </Text>

      <Text style={styles.section}>
        This Pre-Approval is not a commitment for a loan or for a specific rate.
        Any rates quoted are only an indication of current rates at the time of
        this Pre-Approval letter.
      </Text>

      <Text style={styles.section}>
        Please call me if you have any questions.
      </Text>

      <View style={styles.signature}>
        <Text>Sincerely,</Text>
        <Text style={{ marginTop: 10 }}>John Doe</Text>
        <Text>Branch Manager</Text>
        <Text>NMLS: 1234567</Text>
        <Text>Phone: 111.222.3333</Text>
        <Text>Email: admin@loansnstuff.com</Text>
      </View>
    </Page>
  </Document>
);
