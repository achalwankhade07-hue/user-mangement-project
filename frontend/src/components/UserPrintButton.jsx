import React from 'react';
import jsPDF from 'jspdf';
import './UserPrintButton.css';
const UserPrintButton = ({ user }) => {

  const handlePrintPDF = () => {
    // A4 Portrait Size: 210mm x 297mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const marginX = 15;
    let currentY = 20;

    // 1. Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Customer Information Sheet', 105, currentY, { align: 'center' });

    currentY += 12;

    // 2. Company Name & Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Company Name line
    const companyVal = user?.companyName || '';
    doc.text(companyVal, marginX + 5, currentY - 2);
    doc.setLineWidth(0.5);
    doc.line(marginX, currentY, 95, currentY);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Company Name', 55, currentY + 4, { align: 'center' });

    // Date line
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(formattedDate, 120, currentY - 2);
    doc.line(110, currentY, 195, currentY);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Date', 152, currentY + 4, { align: 'center' });

    currentY += 12;

    // Helper Function for Dark Grey Banner Header
    const drawSectionHeader = (title, yPos) => {
      doc.setFillColor(80, 80, 80); // Dark grey background
      doc.rect(marginX, yPos, 180, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(title, 105, yPos + 5, { align: 'center' });
    };

    // --- SECTION 1: CUSTOMER INFORMATION ---
    drawSectionHeader('Customer Information', currentY);
    currentY += 13;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Full Name
    doc.text('Full Name:', marginX, currentY);
    const fullNameVal = user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''} ${user?.middleName || ''}`.trim() || 'N/A';
    doc.text(fullNameVal, 45, currentY - 1);
    doc.line(42, currentY, 195, currentY);

    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Last', 65, currentY, { align: 'center' });
    doc.text('First', 118, currentY, { align: 'center' });
    doc.text('Middle', 170, currentY, { align: 'center' });

    // Address
    currentY += 9;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Address:', marginX, currentY);
    doc.text(user?.address || user?.street || 'N/A', 45, currentY - 1);
    doc.line(42, currentY, 195, currentY);

    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Street Address', 118, currentY, { align: 'center' });

    currentY += 7;
    doc.line(42, currentY, 195, currentY);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${user?.city || ''}    ${user?.state || ''}    ${user?.zip || ''}`.trim() || 'N/A', 45, currentY - 1);

    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('City', 65, currentY, { align: 'center' });
    doc.text('State', 118, currentY, { align: 'center' });
    doc.text('ZIP Code', 170, currentY, { align: 'center' });

    // Phone & SSN
    currentY += 9;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Home Phone:', marginX, currentY);
    doc.text(user?.mobile || user?.phone || 'N/A', 45, currentY - 1);
    doc.line(42, currentY, 95, currentY);

    doc.text('Social Security', 102, currentY - 2);
    doc.text('Number:', 102, currentY + 2);
    doc.text(user?.ssn || user?.id?.toString() || 'N/A', 135, currentY - 1);
    doc.line(132, currentY + 2, 195, currentY + 2);

    // Bill to Address
    currentY += 11;
    doc.text('Bill to Address:', marginX, currentY);
    doc.text(user?.billingAddress || user?.address || 'N/A', 45, currentY - 1);
    doc.line(42, currentY, 195, currentY);

    currentY += 13;

    // --- SECTION 2: BILLING ADDRESS ---
    drawSectionHeader('Billing Address', currentY);
    currentY += 13;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Name (if', marginX, currentY - 2);
    doc.text('different from', marginX, currentY + 2);
    doc.text('above):', marginX, currentY + 6);

    const billingName = user?.billingName || 'N/A';
    doc.setFontSize(10);
    doc.text(billingName, 45, currentY + 3);
    doc.line(42, currentY + 4, 195, currentY + 4);

    currentY += 8;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Last', 65, currentY, { align: 'center' });
    doc.text('First', 118, currentY, { align: 'center' });
    doc.text('Middle', 170, currentY, { align: 'center' });

    // Address
    currentY += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Address:', marginX, currentY);
    doc.text(user?.billingStreet || 'N/A', 45, currentY - 1);
    doc.line(42, currentY, 195, currentY);

    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Street Address', 118, currentY, { align: 'center' });

    currentY += 7;
    doc.line(42, currentY, 195, currentY);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${user?.billingCity || ''}    ${user?.billingState || ''}    ${user?.billingZip || ''}`.trim() || 'N/A', 45, currentY - 1);

    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('City', 65, currentY, { align: 'center' });
    doc.text('State', 118, currentY, { align: 'center' });
    doc.text('ZIP Code', 170, currentY, { align: 'center' });

    // Preferred Invoice Method
    currentY += 9;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Preferred', marginX, currentY - 1);
    doc.text('Invoice Method:', marginX, currentY + 3);

    doc.line(42, currentY + 4, 195, currentY + 4);
    doc.setFontSize(10);
    doc.text(user?.preferredInvoiceMethod || 'Email', 118, currentY + 3, { align: 'center' });

    currentY += 8;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Email', 65, currentY, { align: 'center' });
    doc.text('Fax', 118, currentY, { align: 'center' });
    doc.text('Mail', 170, currentY, { align: 'center' });

    currentY += 12;

    // --- SECTION 3: SHIPPING ADDRESS ---
    drawSectionHeader('Shipping Address', currentY);
    currentY += 13;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Address:', marginX, currentY);
    doc.text(user?.shippingAddress || user?.address || 'N/A', 45, currentY - 1);
    doc.line(42, currentY, 195, currentY);

    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Street Address', 118, currentY, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('© TEMPLATEROLLER.COM', 105, 285, { align: 'center' });

    // Force fresh preview (Avoid Browser Blob Cache)
    const stringBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(stringBlob);
    window.open(blobUrl, '_blank');
  };

  return (
  <>
    <button
      onClick={handlePrintPDF}
      style={{
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Print Form Sheet (New Format)
    </button>
  </>
);
};

export default UserPrintButton;