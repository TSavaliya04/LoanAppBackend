import { Document, Image, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";

const DARK = "#1A0B4B";
const PURPLE = "#5B21B6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  // ── Header ──────────────────────────────────────────────────────────────
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  logoImg: { width: 32, height: 32 },
  logoTextWrap: { marginLeft: 8 },
  logoName: { fontSize: 19, fontWeight: "bold", color: DARK },
  logoTagline: { fontSize: 6, letterSpacing: 2, color: "#4B5563", marginTop: 1 },
  headerDivider: { height: 1.5, backgroundColor: PURPLE, marginBottom: 8 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
    paddingHorizontal: 3,
  },
  agentName: { fontSize: 12, fontWeight: "bold", color: "#111" },
  agentDetail: { fontSize: 8.5, color: "#4B5563", marginTop: 3 },
  titleRight: { alignItems: "flex-end" },
  title: { fontSize: 17, fontWeight: "bold", color: DARK, letterSpacing: 0.5 },
  titleAccent: { color: PURPLE },
  subtitle: { fontSize: 6.5, letterSpacing: 1.8, color: "#9CA3AF", marginTop: 5 },
  // ── Sections ────────────────────────────────────────────────────────────
  sectionCard: {
    borderRadius: 6,
    borderWidth: 0.75,
    borderColor: "#DDD6F3",
    marginBottom: 9,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F3FF",
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ECE7FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#2E0A6B" },
  body: { paddingTop: 2, paddingBottom: 4, paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: 10, color: "#4B5563" },
  value: { fontSize: 10, color: "#111" },
  accentValue: { fontSize: 10, fontWeight: "bold", color: PURPLE },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1EDFC",
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  totalLabel: { fontSize: 12, fontWeight: "bold", color: "#2E0A6B" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#4C1D95" },
});

const ICON_HOME = "M3 11l9-8 9 8 M5 10v11h5v-6h4v6h5V10";
const ICON_CALC = "M6 3h12v18H6z M9 6h6v3H9z M9 13h1 M12 13h1 M15 13h1 M9 17h1 M12 17h1 M15 17h1";
const ICON_COINS =
  "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6";

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.iconCircle}>
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d={icon} fill="none" stroke="#3B1A8C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// 🏡 Props for the mortgage summary
type MortgageSummaryProps = {
  spanish: boolean;
  loanProgram: string;
  homeValue: string;
  interestRate: string;
  downPayment: string;
  principalInterest: string;
  propertyTax: string;
  hazardInsurance: string;
  mortgageInsurance: string;
  hoaFee?: string;
  monthlyTotal: string;
  closingDownPayment: string;
  closingCosts: string;
  prepaids: string;
  earnestMoneyDeposit: string;
  sellerCredit: string;
  lenderCredit: string;
  miscFee4: string;
  totalRequired: string;
  // Agent / header info
  agentName: string;
  agentNmls: string;
  agentPhone: string;
  agentEmail: string;
  agentProfile: string; // URL or empty string
  agentInitials: string; // e.g. "TS" – used when profile is empty
  borrowerName: string;
};

export const QuickQuotePDF = ({ data }: { data: MortgageSummaryProps }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.logoRow}>
        <Image src="/icons/icon-192x192.png" style={styles.logoImg} />
        <View style={styles.logoTextWrap}>
          <Text style={styles.logoName}>Loans N Stuff</Text>
          <Text style={styles.logoTagline}>QUOTE  •  COMPARE  •  CLOSE</Text>
        </View>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.titleRow}>
        <View>
          <Text style={styles.agentName}>{data.agentName}</Text>
          <Text style={styles.agentDetail}>
            {[data.agentNmls ? `NMLS: ${data.agentNmls}` : "", data.agentPhone, data.agentEmail]
              .filter(Boolean)
              .join("  |  ")}
          </Text>
        </View>
        <View style={styles.titleRight}>
          <Text style={styles.title}>
            {data.spanish ? "RESUMEN " : "MORTGAGE "}
            <Text style={styles.titleAccent}>{data.spanish ? "HIPOTECARIO" : "SUMMARY"}</Text>
          </Text>
          <Text style={styles.subtitle}>
            {data.spanish ? "DETALLES CLAVE DE UN VISTAZO" : "KEY DETAILS AT A GLANCE"}
          </Text>
        </View>
      </View>

      {/* Loan Information Section */}
      <View style={styles.sectionCard}>
        <SectionHeader icon={ICON_HOME} title={data.spanish ? "Información del préstamo" : "Loan Information"} />
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Tipo de préstamo" : "Loan Type"}:</Text>
            <Text style={styles.value}>{data.loanProgram}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Valor de la vivienda" : "Home Value"}:</Text>
            <Text style={styles.value}>${data.homeValue}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Tasa de interés" : "Interest Rate"}:</Text>
            <Text style={styles.accentValue}>{data.interestRate}%</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>{data.spanish ? "Depósito" : "Down Payment"}:</Text>
            <Text style={styles.accentValue}>{data.downPayment}%</Text>
          </View>
        </View>
      </View>

      {/* Monthly Breakdown Section */}
      <View style={styles.sectionCard}>
        <SectionHeader icon={ICON_CALC} title={data.spanish ? "Desglose mensual" : "Monthly Breakdown"} />
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Principal e interés" : "Principal & Interest"}:</Text>
            <Text style={styles.value}>${data.principalInterest}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Impuesto sobre la propiedad" : "Property Tax"}:</Text>
            <Text style={styles.value}>${data.propertyTax}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Seguro contra riesgos" : "Hazard Insurance"}:</Text>
            <Text style={styles.value}>${data.hazardInsurance}</Text>
          </View>
          <View style={[styles.row, data.hoaFee ? {} : styles.rowLast]}>
            <Text style={styles.label}>{data.spanish ? "Seguro hipotecario" : "Mortgage Insurance"}:</Text>
            <Text style={styles.value}>${data.mortgageInsurance}</Text>
          </View>
          {data.hoaFee && (
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.label}>{data.spanish ? "Tarifa de Asociación de Propietarios" : "HOA Fee"}:</Text>
              <Text style={styles.value}>${data.hoaFee}</Text>
            </View>
          )}
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{data.spanish ? "Total mensual" : "Monthly Total"}:</Text>
          <Text style={styles.totalValue}>${data.monthlyTotal}</Text>
        </View>
      </View>

      {/* Assets & Closing Section */}
      <View style={styles.sectionCard}>
        <SectionHeader icon={ICON_COINS} title={data.spanish ? "Activos y cierre" : "Assets & Closing"} />
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Gastos de cierre" : "Closing Costs"}:</Text>
            <Text style={styles.value}>${data.closingCosts}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Depósito" : "Down Payment"}:</Text>
            <Text style={styles.value}>${data.closingDownPayment}</Text>
          </View>
          {data.earnestMoneyDeposit && (
            <View style={styles.row}>
              <Text style={styles.label}>{data.spanish ? "Depósito de garantía (EMD)" : "Earnest Money Deposit (EMD)"}:</Text>
              <Text style={[styles.value, { color: "red" }]}>- ${data.earnestMoneyDeposit}</Text>
            </View>
          )}
          {data.sellerCredit && (
            <View style={styles.row}>
              <Text style={styles.label}>{data.spanish ? "Crédito del vendedor" : "Seller Credit"}:</Text>
              <Text style={[styles.value, { color: "red" }]}>- ${data.sellerCredit}</Text>
            </View>
          )}
          {data.lenderCredit && (
            <View style={styles.row}>
              <Text style={styles.label}>{data.spanish ? "Crédito del prestamista" : "Lender Credit"}:</Text>
              <Text style={[styles.value, { color: "red" }]}>- ${data.lenderCredit}</Text>
            </View>
          )}
          {data.miscFee4 && (
            <View style={styles.row}>
              <Text style={styles.label}>{data.spanish ? "Tarifa miscelánea" : "Misc Fee"}:</Text>
              <Text style={[styles.value, { color: "red" }]}>- ${data.miscFee4}</Text>
            </View>
          )}
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{data.spanish ? "Total requerido" : "Total Required"}:</Text>
          <Text style={styles.totalValue}>${data.totalRequired}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
