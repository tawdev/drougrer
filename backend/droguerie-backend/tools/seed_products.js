const mysql = require('mysql2/promise');
require('dotenv').config();

const productsData = {
  "Peinture": [
    { name: "Peinture Satinée Colorado 5L - Blanc", price: 350.00, sku: "PEI-COL-SCB-5L" },
    { name: "Peinture Mat Colorado 10L - Gris Perle", price: 580.00, sku: "PEI-COL-MGP-10L" },
    { name: "Vernis Brillant Jotun 1L - Noyer", price: 145.00, sku: "PEI-JOT-VBN-1L" },
    { name: "Peinture Façade Astral 20kg", price: 890.00, sku: "PEI-AST-FAC-20K" },
    { name: "Sous-couche Universelle Astral 5L", price: 290.00, sku: "PEI-AST-SCU-5L" },
    { name: "Peinture Cuisine & Bain Colorado 2.5L", price: 240.00, sku: "PEI-COL-CB-2.5L" },
    { name: "Laque Glycéro Brillante Colorado 1L", price: 95.00, sku: "PEI-COL-LGB-1L" },
    { name: "Enduit de rebouchage prêt à l'emploi 5kg", price: 85.00, sku: "PEI-END-REP-5K" },
    { name: "Pinceau Plat Professionnel 50mm", price: 35.00, sku: "ACC-PIN-PRO-50" },
    { name: "Rouleau Anti-goutte complet 180mm", price: 75.00, sku: "ACC-ROU-ANT-180" },
    { name: "Peinture Epoxy pour Sol 5kg", price: 650.00, sku: "PEI-EPO-SOL-5K" },
    { name: "Fixateur Fond de Peinture 5L", price: 180.00, sku: "PEI-FIX-FON-5L" }
  ],
  "Outillage": [
    { name: "Perceuse à Percussion Bosch 750W", price: 1250.00, sku: "OUT-BOS-PP-750" },
    { name: "Meuleuse d'angle DeWalt 125mm", price: 1450.00, sku: "OUT-DEW-MA-125" },
    { name: "Marteau Perforateur Bosch GBH 2-26", price: 2850.00, sku: "OUT-BOS-GBH-226" },
    { name: "Scie Circulaire DeWalt Professional", price: 1950.00, sku: "OUT-DEW-SC-PRO" },
    { name: "Coffret de 100 outils complets", price: 950.00, sku: "OUT-COF-100" },
    { name: "Visseuse sans fil 18V avec 2 batteries", price: 1100.00, sku: "OUT-VIS-18V" },
    { name: "Niveau Laser Vert DeWalt 30m", price: 3200.00, sku: "OUT-DEW-LAS-V" },
    { name: "Télémètre Laser Bosch 40m", price: 750.00, sku: "OUT-BOS-TEL-40" },
    { name: "Poste à souder Inverter 200A", price: 1850.00, sku: "OUT-SOU-INV-200" },
    { name: "Compresseur d'air 50L 2HP", price: 2200.00, sku: "OUT-COM-50L" },
    { name: "Jeu de 12 clés mixtes professionnelles", price: 320.00, sku: "OUT-CLE-12-MIX" },
    { name: "Coffret douilles 1/4\" & 1/2\" 94 pcs", price: 850.00, sku: "OUT-DOU-94" }
  ],
  "Plomberie": [
    { name: "Mitigeur Cuisine Grohe Eurosmart", price: 1150.00, sku: "PLO-GRO-EUR-MIT" },
    { name: "Colonne de Douche Thermostatique Grohe", price: 4200.00, sku: "PLO-GRO-COL-THE" },
    { name: "Siphon de lavabo PVC 40mm", price: 25.00, sku: "PLO-SIP-LAB-40" },
    { name: "WC Pack Complet Sortie Horizontale", price: 1850.00, sku: "PLO-WC-PACK-HOR" },
    { name: "Chauffe-eau Électrique 50L Vertical", price: 1450.00, sku: "PLO-CHA-ELE-50L" },
    { name: "Tube Multicouche 16mm (Couronne 50m)", price: 650.00, sku: "PLO-TUB-MUL-16" },
    { name: "Raccord Multicouche Femelle 1/2\" - 16", price: 28.00, sku: "PLO-RAC-MUL-12" },
    { name: "Vanne d'arrêt à boisseau 1/2\"", price: 45.00, sku: "PLO-VAN-BOI-12" },
    { name: "Évier Inox Double Bac 120cm", price: 950.00, sku: "PLO-EVI-INO-DB" },
    { name: "Flexible de douche universel 1.5m", price: 65.00, sku: "PLO-FLE-DOU-15" },
    { name: "Bonde de douche clic-clac 90mm", price: 120.00, sku: "PLO-BON-DOU-90" },
    { name: "Adoucisseur d'eau domestique 22L", price: 8500.00, sku: "PLO-ADO-EAU-22L" }
  ],
  "Quincaillerie": [
    { name: "Serrure de porte 3 points", price: 450.00, sku: "QUI-SER-3P" },
    { name: "Lot de 500 vis menuiserie 4x40", price: 120.00, sku: "QUI-VIS-440-500" },
    { name: "Poignée de porte Double Inox", price: 185.00, sku: "QUI-POI-INO" },
    { name: "Cylindre de sécurité 30x30 Nickel", price: 220.00, sku: "QUI-CYL-SEC-30" },
    { name: "Entre-bailleur de fenêtre PVC", price: 45.00, sku: "QUI-ENT-FEN" },
    { name: "Grosse boîte de chevilles nylon multi-usage", price: 140.00, sku: "QUI-CHE-NYL" },
    { name: "Paumelle de porte 100mm (le lot de 10)", price: 280.00, sku: "QUI-PAU-100-10" },
    { name: "Cadenas Haute Sécurité 50mm", price: 95.00, sku: "QUI-CAD-SEC-50" },
    { name: "Butée de porte murale Inox", price: 25.00, sku: "QUI-BUT-MUR-INO" },
    { name: "Coffre-fort à combinaison électronique 8L", price: 650.00, sku: "QUI-COF-FOR-8L" },
    { name: "Support étagère décoratif noir (la paire)", price: 65.00, sku: "QUI-SUP-ETA-P" },
    { name: "Roulettes pivotantes avec frein (lot de 4)", price: 240.00, sku: "QUI-ROU-FRE-4" }
  ],
  "Électricité": [
    { name: "Tableau Électrique Pré-équipé 2 Rangées", price: 850.00, sku: "ELE-TAB-PRE-2R" },
    { name: "Interrupteur Va-et-vient Blanc", price: 22.00, sku: "ELE-INT-VAV-B" },
    { name: "Prise de courant 16A avec Terre", price: 25.00, sku: "ELE-PRI-16A-T" },
    { name: "Disjoncteur Divisionnaire 16A", price: 45.00, sku: "ELE-DIS-DIV-16" },
    { name: "Couronne Câble RO2V 3G1.5 50m", price: 480.00, sku: "ELE-CAB-3G15-50" },
    { name: "Spot LED Encastrable 7W Blanc Chaud", price: 45.00, sku: "ELE-SPO-LED-7W" },
    { name: "Dalle LED 600x600 40W 4000K", price: 280.00, sku: "ELE-DAL-LED-40" },
    { name: "Gaine ICTA 20mm (Couronne 50m)", price: 145.00, sku: "ELE-GAI-ICTA-20" },
    { name: "Compteur Électrique Divisionnaire", price: 350.00, sku: "ELE-COM-DIV" },
    { name: "Sonnette sans fil portée 100m", price: 120.00, sku: "ELE-SON-SF-100" },
    { name: "Projecteur LED Extérieur 50W avec Détecteur", price: 320.00, sku: "ELE-PRO-LED-50W" },
    { name: "Visiophone Couleur mains libres", price: 1450.00, sku: "ELE-VIS-COU" }
  ],
  "Matériaux de Construction": [
    { name: "Ciment gris CPJ45 50kg", price: 85.00, sku: "MAT-CIM-CPJ45" },
    { name: "Sac de Plâtre 40kg", price: 45.00, sku: "MAT-PLA-40K" },
    { name: "Brique Rouge 8 trous (l'unité)", price: 2.50, sku: "MAT-BRI-RED-8" },
    { name: "Poteau Fer à béton 12mm (la barre de 6m)", price: 110.00, sku: "MAT-FER-12-6M" },
    { name: "Agglo de 15 (l'unité)", price: 6.50, sku: "MAT-AGG-15" },
    { name: "Sable de mer lavé (le grand sac)", price: 35.00, sku: "MAT-SAB-LAV" },
    { name: "Gravette 15/25 (le grand sac)", price: 38.00, sku: "MAT-GRA-1525" },
    { name: "Plaque de Plâtre BA13 250x120cm", price: 115.00, sku: "MAT-PPL-BA13" },
    { name: "Mortier de Jointoiement Carrelage 5kg", price: 65.00, sku: "MAT-MOR-JOI-5" },
    { name: "Sac à Gravats Résistant (lot de 10)", price: 45.00, sku: "MAT-SAC-GRA-10" },
    { name: "Étanchéité sous carrelage 10kg", price: 480.00, sku: "MAT-ETA-SCA-10" },
    { name: "Laine de Verre 100mm (rouleau 10m2)", price: 420.00, sku: "MAT-LAI-VER-100" }
  ]
};

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'droguerie_db',
  });

  console.log('Connected to database.');

  // 1. Handle Categories
  const categoryMap = {}; // name -> id
  const [existingCategories] = await connection.execute('SELECT id, name FROM categories');
  
  for (const cat of existingCategories) {
    categoryMap[cat.name] = cat.id;
  }

  const targetCategoryNames = Object.keys(productsData);
  
  for (const name of targetCategoryNames) {
    if (!categoryMap[name]) {
      // Create it
      console.log(`Creating category: ${name}`);
      const [res] = await connection.execute('INSERT INTO categories (name, isActive) VALUES (?, ?)', [name, true]);
      categoryMap[name] = res.insertId;
    } else {
      console.log(`Category exists: ${name} (ID: ${categoryMap[name]})`);
    }
  }

  // 2. Clear old products for these categories to avoid duplicates in this specific seed run
  const catIds = Object.values(categoryMap);
  // await connection.execute('DELETE FROM products WHERE categoryId IN (' + catIds.join(',') + ')');
  // ^ Disabling delete for safety, user asked to "insert products", usually implying additive. 
  // However, I'll add a check or just assume freshness.

  // 3. Insert Products
  for (const [catName, products] of Object.entries(productsData)) {
    const categoryId = categoryMap[catName];
    console.log(`Inserting ${products.length} products for ${catName}...`);
    
    for (const p of products) {
      // Use Unsplash images based on category
      let imgSearch = catName.toLowerCase();
      if (imgSearch === 'peinture') imgSearch = 'paint tools';
      if (imgSearch === 'outillage') imgSearch = 'hardware tools';
      if (imgSearch === 'plomberie') imgSearch = 'plumbing';
      if (imgSearch === 'quincaillerie') imgSearch = 'hardware locks';
      if (imgSearch === 'électricité') imgSearch = 'electrical panel';
      if (imgSearch === 'matériaux de construction') imgSearch = 'construction materials';

      const imageUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&q=80&w=400&q=${encodeURIComponent(imgSearch)}`;
      // Note: The specific hash after photo- doesn't matter for the placeholder in most cases, 
      // but Unsplash usually needs a real ID. I'll use some known good IDs or generic quality search terms.
      
      const thumbUrl = `https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400&q=${encodeURIComponent(imgSearch)}`;

      await connection.execute(
        'INSERT INTO products (name, sku, price, stock, categoryId, imageUrl, onSale) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.sku, p.price, 100, categoryId, thumbUrl, Math.random() > 0.7]
      );
    }
  }

  console.log('Seeding completed successfully!');
  await connection.end();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
