// ===== Shared Category Mappings =====
// Single source of truth. Imported by app.js, import-csv.html, and recategorize.html
// Format: category -> list of description patterns (case-insensitive matching)

export const CATEGORY_MAPPINGS_GROUPED = {
    camping: [
        'MOUNT RAINIER', 'RECREATION.GOV', 'YOSEMITE'
    ],
    dining: [
        'ARTISAN BAKE', 'AUNTIE ANNES', 'AVA ROASTERIA', 'BAKERY', 'BASKIN',
        'BIGTOWNHERO', 'BOBADOCHI', 'BRAGANZA TEA', 'BUFFET', 'BURGER KING',
        'CAFE', 'CHA CHA CHA Taqueria', 'CHENNAI MASALA', 'CHINESE GOURMET', 'CHIPOTLE',
        'CHOCOLATE', 'CHURROS', 'Clearwater', 'COFFEE', 'CORNER BAKERY',
        'DARVISH KITCHEN', 'DAVESHOTCHICKEN', 'DOMINO\'S', 'DONUTS', 'DUTCH BROS',
        'EATALY', 'Fast food', 'FOOD', 'GELATERIA', 'GENGIS KHAN',
        'GRASSA 6', 'Grill', 'GYRO', 'Haida Sandwich', 'Hiyaku Buffet',
        'HOLIDAY MOKA', 'ICE CREAM', 'IHOP', 'IN-N-OUT', 'JAMBA JUICE',
        'JIMMY JOHN', 'KONA ICE', 'LA DEVOZIONE', 'LE MACARON', 'LEVANT',
        'MADE IN NEW YORK P', 'MAGIC TREATS', 'MCDONALD', 'MIRABELLE BY ORPHEE', 'NONNA EMILIA',
        'PANDA EXPRESS', 'PANERA', 'PAPA JOHN', 'PARIS BAGUETTE', 'PEETS',
        'PHO TANGO', 'PHILLY CHEESE', 'PIZZA', 'Pizzeria', 'PORTLAND ROASTING',
        'RESTAURANT', 'SALT & STRAW', 'SHAKE SHACK', 'SIZZLE PIE', 'SOUL KOREAN',
        'STARBUCKS', 'STRIPES', 'SUBWAY', 'TACO BELL', 'THE MELT',
        'VEGGIE GRILL'
    ],
    donation: [
        'SIMA NASERI'
    ],
    education: [
        'BEAVERTON SD', 'BOOKSTORE', 'COMM COLLEGE', 'FABULOUS', 'FARHAD SHARIFI',
        'FERDOWSI FARSI', 'KRAMERBOOKS', 'LEARNNOVIN', 'MATHNASIUM',
        'SCHOLASTIC', 'WINTERHAWKS ICE'
    ],
    entertainment: [
        '24 HOUR FITNESS', 'CRYSTAL SPRINGS', 'G2A', 'GAMEROW', 'GAMIVO',
        'GAMES', 'MARION ACRES', 'Museum', 'OMSI', 'Oregon Museum', 'Pittock Mansion',
        'REGIONAL PARK BLUE', 'SKY ZONE', 'SUPERPLAY', 'TECH INTERACTIVE',
        'TRISKELEE FARM', 'TUALATIN HILLS PARK', 'woodenshoe.com'
    ],
    fine: [
        'Overdraft'
    ],
    groceries: [
        'ARIANA FOOD MARKET', 'BARBUR WORLD FOODS', 'BAZAAR FOOD MARKET', 'BAZAAR WORLD FOOD',
        'BHAIS', 'CHEFSTORE', 'COSTCO WHSE', 'FRED-MEYER', 'FRESH HALAL',
        'GROCERY OUTLET', 'MARKET OF CHOICE', 'PERSIA FOODS', 'QFC',
        'ROSE INTERNATIONAL', 'SAFEWAY', 'TRADER JOE', 'UNIQUE INTERNATIONAL MAR',
        'WHOLE FOODS', 'WHOLEFDS', 'WINCO'
    ],
    healthcare: [
        'ACUPUNCTURE', 'ALIGN & SHINE', 'BOLLYWOOD EYEBROW', 'CHIROPRACTI',
        'CVS/PHARMACY', 'guangmei Yang', 'HEALTHCARE', 'HODA PARVIN',
        'KAISER DENTAL', 'KP DENTAL', 'KP NW DENTAL', 'KP NW RX',
        'KP WESTSIDE', 'LCA Portland', 'LICE CLIN', 'LUZ LOUNGE',
        'NUTRAFOL', 'PHARMACY', 'WALGREENS'
    ],
    housing: [
        'ADT SECURITY', 'COOPERNSM', 'HOME DEPOT', 'ROCKET MORTGAGE',
        'RODDA PAINT', 'SPRINGVILLE TOWNHO'
    ],
    shopping: [
        'AMAZON', 'BATH AND BODY', 'BURLINGTON', 'CARTERS', 'CLAIRE',
        'Columbia', 'CUTE LIL SHOP', 'DERMSTORE', 'DOLLAR TREE', 'Estee Lauder',
        'FAMOUSFOOTWEAR', 'FAMOUS FOOTWEAR', 'FEDEX', 'GAP', 'GAP.COM',
        'GOODWILL', 'H&M', 'HAIR SALO', 'HENNA', 'HOMEGOODS',
        'IKEA', 'JANELLE JAMES', 'JCPENNEY', 'KOHL', 'LANCOME',
        'Lush', 'MACYS', 'MARSHALLS', 'Muji', 'Nike', 'NORDSTROM',
        'PICCOLO MONDO', 'ROSS STORES', 'SALLY BEAUTY', 'SEPHORA',
        'SHISEIDO', 'TARGET', 'TARGET.COM', 'TATCHA', 'THE CHILDRENS PLACE',
        'ULTA', 'UPS STORE', 'VICTORIAS SECRET', 'WAL-MART', 'WAYFAIR',
        'WWW COSTCO COM', 'ZARA'
    ],
    subscriptions: [
        'MONTHLY MAINTENANCE FEE'
    ],
    transport: [
        '76 -', 'ARCO', 'BEAVERTON KIA', 'BEAVERTON NISSAN', 'CHEVRON',
        'COSTCO GAS', 'GARAGE', 'KAADY CAR WASH', 'PARKMOBILE', 'PARKING',
        'SHELL', 'SPEEDWAY', 'Transit', 'TRAVELERS PER INSUR'
    ],
    travel: [
        'AIRBNB', 'ALLIANZ TRAVEL', 'Alpnachstad', 'BERN', 'BOLOGNA',
        'BRIENZ', 'Delta Cars', 'DELTA AIR LINES', 'EMIRATES', 'Engelberg',
        'EXPEDIA', 'FIRENZE', 'FLYING J', 'Glattbrugg', 'GREAT WOLF',
        'Grindelwald', 'HENRY COWELL REDW', 'Hofstetten', 'HOTEL', 'Interlaken',
        'Las Vegas', 'Lugano', 'Luzern', 'Menziken', 'MILANO',
        'OREGON COAST AQUARIUM', 'OVAGO AIR', 'PDX AIRPORT', 'QATAR AIR', 'RITZ CARLTON',
        'SAN JOSE', 'SANTA CLARA', 'Santa Cruz', 'SEA AIRPORT', 'SOUTHWES',
        'TRENITALIA', 'TURKISH AIR', 'VENEZIA', 'VERONA', 'Wengen',
        'ZURICH'
    ],
    utilities: [
        'GOOGLE *FI', 'GOOGLE*FI', 'Google FI', 'NORTHWEST NATURA', 'PORTLAND GENERAL',
        'TUALATIN VALLEY', 'WASTE MANAGEMENT', 'WM.COM', 'ZIPLY FIBER'
    ],
};

// Flattened lookup: pattern -> category
export const DEFAULT_CATEGORY_MAPPINGS = {};
for (const [category, patterns] of Object.entries(CATEGORY_MAPPINGS_GROUPED)) {
    for (const pattern of patterns) {
        DEFAULT_CATEGORY_MAPPINGS[pattern] = category;
    }
}
