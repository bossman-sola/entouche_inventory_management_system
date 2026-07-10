

export const UNIT_TYPES = ['Count', 'Weight', 'Volume', 'Length', 'Area'];

export const UNIT_TYPE_OPTIONS = UNIT_TYPES.map((type) => ({ value: type, label: type }));


export const UNIT_REFERENCE_DATA = [
  { type: 'Count', name: 'Piece', symbol: 'PCS' },
  { type: 'Count', name: 'Box', symbol: 'BOX' },
  { type: 'Count', name: 'Carton', symbol: 'CTN' },
  { type: 'Count', name: 'Pack', symbol: 'PK' },
  { type: 'Count', name: 'Roll', symbol: 'ROLL' },
  { type: 'Count', name: 'Pair', symbol: 'PR' },
  { type: 'Count', name: 'Set', symbol: 'SET' },
  { type: 'Count', name: 'Unit', symbol: 'UNIT' },
  { type: 'Count', name: 'Dozen', symbol: 'DOZ' },
  { type: 'Count', name: 'Pallet', symbol: 'PLT' },
  { type: 'Weight', name: 'Gram', symbol: 'g' },
  { type: 'Weight', name: 'Kilogram', symbol: 'kg' },
  { type: 'Weight', name: 'Ton', symbol: 't' },
  { type: 'Weight', name: 'Pound', symbol: 'lb' },
  { type: 'Weight', name: 'Ounce', symbol: 'oz' },
  { type: 'Volume', name: 'Milliliter', symbol: 'mL' },
  { type: 'Volume', name: 'Liter', symbol: 'L' },
  { type: 'Volume', name: 'Gallon', symbol: 'gal' },
  { type: 'Volume', name: 'Cubic Meter', symbol: 'm³' },
  { type: 'Length', name: 'Millimeter', symbol: 'mm' },
  { type: 'Length', name: 'Centimeter', symbol: 'cm' },
  { type: 'Length', name: 'Meter', symbol: 'm' },
  { type: 'Length', name: 'Kilometer', symbol: 'km' },
  { type: 'Length', name: 'Inch', symbol: 'in' },
  { type: 'Length', name: 'Foot', symbol: 'ft' },
  { type: 'Length', name: 'Yard', symbol: 'yd' },
  { type: 'Area', name: 'Square Meter', symbol: 'm²' },
  { type: 'Area', name: 'Square Foot', symbol: 'ft²' },
  { type: 'Area', name: 'Acre', symbol: 'ac' },
  { type: 'Area', name: 'Hectare', symbol: 'ha' },
];


export const getUnitNamesByType = (type) =>
  UNIT_REFERENCE_DATA.filter((u) => u.type === type);


export const findUnitReference = (nameOrSymbol) => {
  const needle = String(nameOrSymbol || '').trim().toLowerCase();
  if (!needle) return null;
  return (
    UNIT_REFERENCE_DATA.find(
      (u) => u.name.toLowerCase() === needle || u.symbol.toLowerCase() === needle
    ) || null
  );
};


export const getUnitType = (name, symbol) => {
  const bySymbol = symbol ? findUnitReference(symbol) : null;
  if (bySymbol) return bySymbol.type;
  const byName = name ? findUnitReference(name) : null;
  return byName ? byName.type : null;
};

export const ITEM_TYPES = UNIT_TYPES;