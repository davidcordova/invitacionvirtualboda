import * as XLSX from 'xlsx';

/**
 * Excel / CSV Service - Import, Export & Template Generator
 */

export function downloadExcelTemplate() {
  const sampleData = [
    {
      'Nombre de Invitado / Familia': 'Familia Rodríguez Salazar',
      'Teléfono / WhatsApp': '+51 987 123 456',
      'Pases Asignados': 3,
      'Mesa': 'Mesa 5',
      'Nota Personalizada': '¡Nos llena de ilusión celebrar junto a ustedes!'
    },
    {
      'Nombre de Invitado / Familia': 'Dra. Gabriela Morales & Acomp.',
      'Teléfono / WhatsApp': '+51 912 987 654',
      'Pases Asignados': 2,
      'Mesa': 'Mesa 3',
      'Nota Personalizada': 'Esperamos contar con su distinguida presencia.'
    },
    {
      'Nombre de Invitado / Familia': 'Ing. Mateo Vargas',
      'Teléfono / WhatsApp': '+51 999 555 444',
      'Pases Asignados': 1,
      'Mesa': 'Mesa 7',
      'Nota Personalizada': '¡Te esperamos para brindar en la pista de baile!'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Invitados');

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 35 },
    { wch: 22 },
    { wch: 16 },
    { wch: 15 },
    { wch: 45 }
  ];

  XLSX.writeFile(workbook, 'Plantilla_Importar_Invitados_Boda.xlsx');
}

export function parseExcelOrCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('El archivo no contiene registros o está vacío.');
        }

        // Map column variations flexibly
        const normalized = rawJson.map((row) => {
          const keys = Object.keys(row);
          let name = '';
          let phone = '';
          let passes = 1;
          let table = 'Por asignar';
          let customNote = '';

          keys.forEach(k => {
            const cleanKey = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const val = String(row[k]).trim();

            if (cleanKey.includes('nombre') || cleanKey.includes('invitado') || cleanKey.includes('familia')) {
              name = val;
            } else if (cleanKey.includes('tel') || cleanKey.includes('whatsapp') || cleanKey.includes('celular')) {
              phone = val;
            } else if (cleanKey.includes('pase') || cleanKey.includes('cupo') || cleanKey.includes('cantidad')) {
              const num = parseInt(val, 10);
              if (!isNaN(num) && num > 0) passes = num;
            } else if (cleanKey.includes('mesa') || cleanKey.includes('ubicacion')) {
              table = val || 'Por asignar';
            } else if (cleanKey.includes('nota') || cleanKey.includes('mensaje')) {
              customNote = val;
            }
          });

          return {
            name: name || 'Invitado sin nombre',
            phone,
            passes,
            table,
            customNote
          };
        });

        resolve(normalized);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

export function exportGuestsToExcel(guests) {
  const exportData = guests.map(g => ({
    'Token ID': g.id,
    'Nombre / Familia': g.name,
    'Teléfono WhatsApp': g.phone,
    'Pases Asignados': g.passes,
    'Pases Confirmados': g.confirmedPasses || 0,
    'Pases Ingresados (Check-in)': g.attendedPasses || 0,
    'Mesa': g.table,
    'Estado': g.status.toUpperCase(),
    'Restricciones Alimentarias': g.dietaryRestrictions || 'Ninguna',
    'Canción Sugerida': g.songSuggestion || '',
    'Mensaje / Deseos': g.wishes || '',
    'Fecha de Vista': g.viewedAt ? new Date(g.viewedAt).toLocaleString() : '',
    'Fecha de Confirmación': g.confirmedAt ? new Date(g.confirmedAt).toLocaleString() : '',
    'Fecha de Ingreso': g.checkedInAt ? new Date(g.checkedInAt).toLocaleString() : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista_Oficial_Invitados');

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 32 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 25 },
    { wch: 25 },
    { wch: 35 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 }
  ];

  XLSX.writeFile(workbook, `Lista_Invitados_Boda_Carlos_y_Jackie_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
