import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// === Fuente principal ===
Font.register({
  family: 'Lato',
  fonts: [
    { src: '/fonts/Lato-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Lato-Bold.ttf', fontWeight: 'bold' },
  ],
});

// === Paleta de colores ===
const colors = {
  background: '#F7F2ED',
  accent: '#B86B42',
  text: '#333333',
  gray: '#666666',
  lightGray: '#F5F5F5',
  border: '#E0E0E0',
  white: '#FFFFFF',
};

// === Estilos ===
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.text,
    padding: 40,
    backgroundColor: colors.white,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: colors.background,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  header: {
    marginTop: 25,
    marginBottom: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfo: {
    width: '60%',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  companyDetails: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.3,
  },
  orderInfo: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 170,
  },
  orderTitle: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderLabel: {
    fontSize: 9,
    color: colors.gray,
    textTransform: 'uppercase',
  },
  orderValue: {
    fontSize: 10,
    color: colors.text,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 6,
    marginBottom: 25,
  },
  clientInfoContainer: {
    width: '48%',
  },
  infoText: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: colors.gray,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    marginBottom: 2,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
  },
  altRow: {
    backgroundColor: colors.lightGray,
  },
  colDescription: { width: '35%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTax: { width: '12%', textAlign: 'center' },
  colImporte: { width: '23%', textAlign: 'right' },
  totalsBox: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalLabel: {
    fontSize: 9,
    color: colors.gray,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.accent,
  },
  totalFinalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent,
  },
  payment: {
    marginTop: 25,
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 6,
  },
  paymentLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  paymentText: {
    fontSize: 9,
    color: colors.gray,
  },
  footerWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.background,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: colors.gray,
  },
});

const formatCurrency = (amount) => {
  return (amount || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

const QuotePDF = ({ quote, client }) => (
  <Document author="DIDACTICOS JUGANDO Y EDUCANDO SAS" title={`Pedido ${quote.numero}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerBackground} fixed />

      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>DIDACTICOS JUGANDO Y EDUCANDO SAS</Text>
          <Text style={styles.companyDetails}>AVENIDA 19 114 A 22</Text>
          <Text style={styles.companyDetails}>BOGOTÁ, Colombia</Text>
          <Text style={styles.companyDetails}>NIT: 901144615-6</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>Pedido n° {quote.numero}</Text>
          <Text style={styles.orderLabel}>Fecha de pedido</Text>
          <Text style={styles.orderValue}>
            {new Date(quote.fechaCreacion?.toDate() || Date.now()).toLocaleDateString('es-CO')}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.clientInfoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Facturar a:{"\n"}</Text>
            <Text style={{ fontWeight: 'bold' }}>{client?.nombre || quote.clienteNombre}{"\n"}</Text>
            {/* **CAMBIO AQUÍ: Accedemos a los datos anidados correctamente** */}
            {client?.direccion?.calle || 'Dirección no disponible'}{"\n"}
            {`${client?.direccion?.ciudad || 'Ciudad no disponible'}, ${client?.direccion?.departamento || ''}`}
          </Text>
        </View>
        <View style={styles.clientInfoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Vencimiento: </Text>
            {quote.vencimiento ? new Date(quote.vencimiento).toLocaleDateString('es-CO') : 'No especificado'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Comercial: </Text> {quote.comercialNombre || 'No asignado'}
          </Text>
        </View>
      </View>

      <View>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colDescription]}>Descripción</Text>
          <Text style={[styles.headerCell, styles.colQty]}>Cantidad</Text>
          <Text style={[styles.headerCell, styles.colPrice]}>Precio unitario</Text>
          <Text style={[styles.headerCell, styles.colTax]}>Impuestos</Text>
          <Text style={[styles.headerCell, styles.colImporte]}>Importe</Text>
        </View>
        
        {quote.lineas.map((line, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.altRow]}>
            <Text style={[styles.colDescription]}>{line.productName}</Text>
            <Text style={[styles.colQty]}>{line.quantity.toFixed(2)}</Text>
            <Text style={[styles.colPrice]}>{formatCurrency(line.price)}</Text>
            <Text style={[styles.colTax]}>19%</Text>
            <Text style={[styles.colImporte]}>{formatCurrency(line.quantity * line.price)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Base imponible</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA 19%</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.impuestos)}</Text>
        </View>
        <View style={styles.totalFinal}>
          <Text style={styles.totalFinalLabel}>Total</Text>
          <Text style={styles.totalFinalValue}>{formatCurrency(quote.total)}</Text>
        </View>
      </View>

      <View style={styles.payment}>
        <Text style={styles.paymentLabel}>Condiciones de pago</Text>
        <Text style={styles.paymentText}>{quote.condicionesPago || 'No especificadas'}</Text>
      </View>

      <View style={styles.footerWave} fixed />
      <Text style={styles.footerText} fixed>
        Página 1 / 1 — DIDACTICOS JUGANDO Y EDUCANDO SAS — Bogotá, Colombia
      </Text>
    </Page>
  </Document>
);

export default QuotePDF;