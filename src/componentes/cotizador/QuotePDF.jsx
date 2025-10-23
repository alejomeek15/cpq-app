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

// === Colores base ===
const colors = {
  accent: '#B86B42',
  text: '#333333',
  gray: '#666666',
  lightGray: '#F5F5F5',
  border: '#E0E0E0',
  white: '#FFFFFF',
};

// === Estilos generales ===
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.text,
    paddingTop: 40,
    paddingHorizontal: 50,
    paddingBottom: 60,
    backgroundColor: colors.white,
  },

  // --- ENCABEZADO EMPRESA ---
  companyInfo: {
    textAlign: 'right',
    marginBottom: 25,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  companyDetails: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.3,
  },

  // --- TÍTULO Y CLIENTE ---
  orderHeaderBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderTitle: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: 'bold',
  },
  billingBox: {
    textAlign: 'left',
    width: '50%',
  },
  billingLabel: {
    fontSize: 9,
    color: colors.gray,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 3,
  },
  billingText: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.3,
  },
  billingName: {
    fontWeight: 'bold',
    fontSize: 10,
  },

  // --- INFO SECUNDARIA (Emisión / Vencimiento / Comercial) ---
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  orderLabel: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 3,
  },
  orderValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- TABLA ---
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    paddingVertical: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  colDescription: { width: '35%' },
  colQty: { width: '20%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTax: { width: '10%', textAlign: 'center' },
  colImporte: { width: '20%', textAlign: 'right' },

  // --- TOTALES ---
  totalsBox: {
    marginTop: 10,
    alignSelf: 'flex-end',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
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
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  totalFinalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.accent,
  },
  totalFinalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.accent,
  },

  // --- CONDICIONES DE PAGO ---
  payment: {
    marginTop: 25,
  },
  paymentText: {
    fontSize: 9,
    color: colors.text,
  },
  paymentLabel: {
    fontWeight: 'bold',
  },

  // --- PIE DE PÁGINA ---
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.gray,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
});

// === Funciones auxiliares ===
const formatCurrency = (amount) => {
  return (amount || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

const formatDate = (date) => {
  try {
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-CO');
  } catch {
    return 'Fecha no disponible';
  }
};

// === COMPONENTE PRINCIPAL ===
const QuotePDF = ({ quote, client }) => (
  <Document author="DIDACTICOS JUGANDO Y EDUCANDO SAS" title={`Cotización ${quote.numero}`}>
    <Page size="A4" style={styles.page}>
      {/* ENCABEZADO DE EMPRESA */}
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>DIDACTICOS JUGANDO Y EDUCANDO SAS</Text>
        <Text style={styles.companyDetails}>AVENIDA 19 114 A 22</Text>
        <Text style={styles.companyDetails}>BOGOTÁ</Text>
        <Text style={styles.companyDetails}>Colombia</Text>
        <Text style={styles.companyDetails}>NIT: 901144615-6</Text>
      </View>

      {/* CLIENTE (IZQUIERDA) + TÍTULO (DERECHA) */}
      <View style={styles.orderHeaderBlock}>
        <View style={styles.billingBox}>
          <Text style={styles.billingLabel}>Cliente</Text>
          <Text style={styles.billingName}>{client?.nombre || quote.clienteNombre}</Text>
          <Text style={styles.billingText}>
            {client?.direccion?.calle || 'Dirección no disponible'}
          </Text>
          <Text style={styles.billingText}>
            {`${client?.direccion?.ciudad || 'Ciudad no disponible'}, ${
              client?.direccion?.departamento || ''
            }`}
          </Text>
        </View>

        <Text style={styles.orderTitle}>Cotización n° {quote.numero}</Text>
      </View>

      {/* EMISIÓN / VENCIMIENTO / COMERCIAL */}
      <View style={styles.orderHeader}>
        <View style={styles.dateGroup}>
          <View>
            <Text style={styles.orderLabel}>Emisión</Text>
            <Text style={styles.orderValue}>{formatDate(quote.fechaCreacion)}</Text>
          </View>
          <View>
            <Text style={styles.orderLabel}>Vencimiento</Text>
            <Text style={styles.orderValue}>
              {quote.vencimiento ? formatDate(quote.vencimiento) : 'No especificado'}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.orderLabel}>Comercial</Text>
          <Text style={styles.orderValue}>{quote.comercialNombre || 'No asignado'}</Text>
        </View>
      </View>

      {/* TABLA DE PRODUCTOS */}
      <View>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colDescription]}>Descripción</Text>
          <Text style={[styles.headerCell, styles.colQty]}>Cantidad</Text>
          <Text style={[styles.headerCell, styles.colPrice]}>Precio unitario</Text>
          <Text style={[styles.headerCell, styles.colTax]}>Impuestos</Text>
          <Text style={[styles.headerCell, styles.colImporte]}>Importe</Text>
        </View>

        {quote.lineas.map((line, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.colDescription]}>{line.productName}</Text>
            <Text style={[styles.colQty]}>{Math.round(line.quantity)}</Text>
            <Text style={[styles.colPrice]}>{formatCurrency(line.price)}</Text>
            <Text style={[styles.colTax]}>19%</Text>
            <Text style={[styles.colImporte]}>{formatCurrency(line.quantity * line.price)}</Text>
          </View>
        ))}
      </View>

      {/* TOTALES */}
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

      {/* CONDICIONES DE PAGO */}
      <View style={styles.payment}>
        <Text style={styles.paymentText}>
          <Text style={styles.paymentLabel}>Condiciones de pago: </Text>
          {quote.condicionesPago || 'No especificadas'}
        </Text>
      </View>

      {/* PIE DE PÁGINA */}
      <View style={styles.footer} fixed>
        <Text>Cotización emitida por Didácticos Jugando y Educando SAS</Text>
        <Text>Página 1 / 1</Text>
      </View>
    </Page>
  </Document>
);

export default QuotePDF;
