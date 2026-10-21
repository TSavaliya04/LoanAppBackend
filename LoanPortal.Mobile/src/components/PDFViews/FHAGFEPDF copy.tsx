import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  disclaimer: {
    fontSize: 9,
    fontStyle: "italic",
    marginBottom: 15,
    lineHeight: 1.3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 4,
  },
  value: {
    fontSize: 10,
    color: "#0070C0",
    textDecoration: "underline",
  },
  underlineField: {
    borderBottomWidth: 1,
    borderColor: "#000",
    minWidth: 150,
    paddingBottom: 2,
    marginRight: 12,
  },
  flexFill: {
    flex: 1,
  },
  rightAlign: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

type FHAGFEPDFProps = {
  borrower: string;
  propertyAddress: string;
  date: string;
  loanType: string;
};

export const FHAGFEPDF = ({ data }: { data: FHAGFEPDFProps }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Disclaimer text */}
      <Text style={styles.disclaimer}>
        This worksheet is an initial estimate of the fees you will incur to
        close the mortgage loan. You will be provided with a good faith Estimate
        of Closing Cost and Truth In Lending disclosures, which will provide
        additional information. This is not an approval of your loan, or a
        commitment to make a loan. Rates and loan programs are subject to
        change.
      </Text>

      {/* Borrower + Date + Loan Type Row */}
      <View style={styles.row}>
        <Text style={styles.label}>BORROWER:</Text>
        <View style={[styles.underlineField, styles.flexFill]}>
          <Text style={styles.value}>{data.borrower}</Text>
        </View>

        <View style={styles.rightAlign}>
          <Text style={styles.label}>Date:</Text>
          <View style={styles.underlineField}>
            <Link src={`mailto:${data.date}`} style={styles.value}>
              {data.date}
            </Link>
          </View>
        </View>
      </View>

      {/* Property Address + Loan Type */}
      <View style={styles.row}>
        <Text style={styles.label}>PROPERTY ADDRESS:</Text>
        <View style={[styles.underlineField, styles.flexFill]}>
          <Text style={styles.value}>{data.propertyAddress}</Text>
        </View>

        <View style={styles.rightAlign}>
          <Text style={styles.label}>LOAN TYPE:</Text>
          <View style={styles.underlineField}>
            <Text style={styles.value}>{data.loanType}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
