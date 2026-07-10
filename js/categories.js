// ===== Shared Category Mappings =====
// Single source of truth. Imported by app.js, import-csv.html, and recategorize.html
// Format: category -> list of description patterns (case-insensitive matching)

export const CATEGORY_MAPPINGS_GROUPED = {
    transport: [
        'COSTCO GAS', 'ARCO', '76 -', 'SPEEDWAY', 'SHELL', 'CHEVRON',
        'PARKING', 'KAADY CAR WASH', 'Transit'
    ],
    groceries: [
        'COSTCO WHSE', 'TRADER JOE', 'SAFEWAY', 'QFC',
        'FRED-MEYER', 'WINCO', 'GROCERY OUTLET', 'WHOLEFDS', 'WHOLE FOODS',
        'MARKET OF CHOICE', 'BAZAAR WORLD FOOD', 'BAZAAR FOOD MARKET',
        'FRESH HALAL', 'ARIANA FOOD MARKET', 'ROSE INTERNATIONAL',
        'UNIQUE INTERNATIONAL MAR', 'PERSIA FOODS', 'CHEFSTORE',
        'BARBUR WORLD FOODS'
    ],
    dining: [
        'MCDONALD', 'SUBWAY', 'PANDA EXPRESS', 'IN-N-OUT', 'JIMMY JOHN',
        'CHIPOTLE', 'STARBUCKS', 'PEETS', 'SHAKE SHACK', 'DUTCH BROS',
        'GYRO', 'CORNER BAKERY', 'CHENNAI MASALA', 'MIRABELLE BY ORPHEE',
        'CHINESE GOURMET', 'PIZZA', 'RESTAURANT', 'BAKERY', 'GELATERIA',
        'DONUTS', 'Clearwater', 'Hiyaku Buffet', 'NONNA EMILIA', 'PORTLAND ROASTING',
        'MAGIC TREATS', 'VEGGIE GRILL', 'DARVISH KITCHEN',
        'LA DEVOZIONE', 'MADE IN NEW YORK P', 'GRASSA 6', 'AVA ROASTERIA', 'PANERA',
        'DAVESHOTCHICKEN', 'SALT & STRAW', 'PARIS BAGUETTE', 'STRIPES',
        'PHO TANGO', 'GENGIS KHAN', 'Grill', 'BASKIN', 'CHOCOLATE', 'Fast food',
        'BIGTOWNHERO', 'EATALY', 'BRAGANZA TEA', 'BUFFET', 'JAMBA JUICE', 'SIZZLE PIE',
        'PHILLY CHEESE', 'DOMINOS', 'PAPA JOHN', 'BURGER KING', 'TACO BELL',
        'HOLIDAY MOKA', 'CHURROS', 'Pizzeria', 'IHOP',
        'CAFE', 'ICE CREAM', 'KONA ICE', 'THE MELT', 'BOBADOCHI'
    ],
    shopping: [
        'AMAZON', 'TARGET', 'TARGET.COM', 'MARSHALLS', 'HOMEGOODS',
        'GOODWILL', 'ROSS STORES', 'BURLINGTON', 'JCPENNEY', 'MACYS',
        'NORDSTROM', 'GAP US', 'H&M', 'CLAIRE', 'DOLLAR TREE', 'KOHL', 'TATCHA',
        'BATH AND BODY', 'SEPHORA', 'ULTA', 'UPS STORE', 'FEDEX', 'WWW COSTCO COM',
        'CUTE LIL SHOP', 'FAMOUSFOOTWEAR', 'FAMOUS FOOTWEAR', 'SHISEIDO', 'DERMSTORE',
        'WAL-MART', 'Nike', 'JANELLE JAMES', 'CARTERS', 'GAP.COM', 'SALLY BEAUTY'
    ],
    housing: ['HOME DEPOT', 'RODDA PAINT', 'ROCKET MORTGAGE', 'SPRINGVILLE TOWNHO', 'COOPERNSM'],
    healthcare: [
        'KP NW DENTAL', 'KP DENTAL', 'KAISER DENTAL', 'KP NW RX',
        'WALGREENS', 'CVS/PHARMACY', 'KP WESTSIDE', 'ALIGN & SHINE',
        'BOLLYWOOD EYEBROW'
    ],
    travel: [
        'QATAR AIR', 'SOUTHWES', 'TURKISH AIR', 'OVAGO AIR', 'EXPEDIA',
        'HOTEL', 'GREAT WOLF', 'RITZ CARLTON', 'TRENITALIA', 'SEA AIRPORT',
        'Las Vegas', 'PDX AIRPORT', 'Hofstetten', 'YOSEMITE', 'FLYING J',
        'ZURICH', 'VENEZIA', 'BOLOGNA', 'VERONA', 'FIRENZE', 'Lugano',
        'MILANO', 'Interlaken', 'Wengen', 'Grindelwald', 'Engelberg',
        'HENRY COWELL REDW', 'OREGON COAST AQUARIUM', 'RECREATION.GOV'
    ],
    education: ['SCHOLASTIC', 'BEAVERTON SD', 'KRAMERBOOKS', 'BOOKSTORE', 'WINTERHAWKS ICE',
                'LEARNNOVIN', 'FARHAD SHARIFI'
    ],
    entertainment: [
        'MYSTERY SPOT', 'TECH INTERACTIVE', 'SUPERPLAY', '24 HOUR FITNESS', 'SKY ZONE',
        'MARION ACRES', 'CRYSTAL SPRINGS', 'TUALATIN HILLS PARK', 'REGIONAL PARK BLUE',
        'TRISKELEE FARM', 'Oregon Museum', 'OMSI', 'Pittock Mansion'
    ],
    utilities: ['ZIPLY FIBER', 'PORTLAND GENERAL', 'NORTHWEST NATURA', 'TUALATIN VALLEY',
                'WASTE MANAGEMENT', 'GOOGLE *FI', 'Google FI'],
};

// Flattened lookup: pattern -> category
export const DEFAULT_CATEGORY_MAPPINGS = {};
for (const [category, patterns] of Object.entries(CATEGORY_MAPPINGS_GROUPED)) {
    for (const pattern of patterns) {
        DEFAULT_CATEGORY_MAPPINGS[pattern] = category;
    }
}
