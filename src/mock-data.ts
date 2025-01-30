export const Category_LIST = [
  { name: 'All', isExpanded: true, isSelected: true, useRole: 'Both' },
  {
    name: 'Bridal Accessories',
    isExpanded: false,
    isSelected: false,
    useRole: 'Bride',
  }, 
  {
    name: "Bride's Jewelry",
    isExpanded: false,
    isSelected: false,
    useRole: 'Bride',
  },
  {
    name: "Bride's Fashion",
    isExpanded: false,
    isSelected: false,
    useRole: 'Bride',
  },
  {
    name: "Groom's Fashion",
    isExpanded: false,
    isSelected: false,
    useRole: 'Groom',
  },
  {
    name: "Groom's Accessories",
    isExpanded: false,
    isSelected: false,
    useRole: 'Groom',
  },
];

export const REWARD_LIST = [
  // Bride's Clothing & Accessories
  {
    pk: 987,
    name: 'Bridal Lehenga',
    Rent: 120,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSExspBv_dtDq_eCxxNRHYtSexxvBTcdSxGTg&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 14,
    valid_until: '2024-12-31T00:00:00',
    low_quantity: 10,
    category: "Bride's Fashion",
    description: 'Traditional bridal lehengas for a royal look.',
    buyers: 142,
    userRole: 'Bride',
  },
  {
    pk: 988,
    name: 'Bridal Saree',
    Rent: 100,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxPfypc8EMbDHm6QSeCjxYSnfOH1kmUeej9A&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 14,
    valid_until: '2025-01-15T00:00:00',
    low_quantity: 10,
    category: "Bride's Fashion",
    description: 'Elegant saree collections perfect for weddings.',
    buyers: 97,
    userRole: 'Bride',
  },
  {
    pk: 999,
    name: 'Bridal Jewelry Set',
    Rent: 200,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2EbOyNPO41ZUYWwW3YfDNMUwtMpTe79RaRQ&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 20,
    valid_until: '2025-03-01T00:00:00',
    low_quantity: 15,
    category: 'Bridal Accessories',
    description: 'Exquisite jewelry sets to complement your bridal look.',
    buyers: 185,
    userRole: 'Bride',
  },

  // Groom's Clothing & Accessories
  {
    pk: 994,
    name: 'Groom’s Sherwani',
    Rent: 200,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuP0YHSBzJp1eu_h5IrcC436rpyA8gW8qUGQ&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 10,
    valid_until: '2025-02-28T00:00:00',
    low_quantity: 5,
    category: "Groom's Fashion",
    description: 'Traditional sherwanis for the groom.',
    buyers: 137,
    userRole: 'Groom',
  },
  {
    pk: 995,
    name: 'Groom’s Kurta',
    Rent: 180,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZn0C-WmFXJAEqEIpHbsx3-TynAdwHWds4Rg&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 8,
    valid_until: '2025-01-30T00:00:00',
    low_quantity: 5,
    category: "Groom's Fashion",
    description: 'Elegant kurtas for the groom’s wedding day.',
    buyers: 124,
    userRole: 'Groom',
  },
  {
    pk: 1004,
    name: 'Groom’s Footwear',
    Rent: 150,
    display_img_urls: [
      'https://images.shaadisaga.com/shaadisaga_production/photos/pictures/000/476/587/new_medium/tsg.jpg?1532692507',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 12,
    valid_until: '2025-03-01T00:00:00',
    low_quantity: 6,
    category: "Groom's Accessories",
    description: 'Premium footwear for the groom on his special day.',
    buyers: 142,
    userRole: 'Groom',
  },

  // Neutral Category (For both Bride and Groom)
  {
    pk: 989,
    name: 'Wedding Feast',
    Rent: 50,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTXR-DEATklpzugY810ZZcvCVj15yk0CiFxw&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 14,
    valid_until: '2024-12-31T00:00:00',
    low_quantity: 10,
    category: 'Wedding Feast',
    description: 'Delicious wedding feasts delivered to your venue.',
    buyers: 231,
    userRole: 'Both',
  },

  // Groom's Wedding Tech
  {
    pk: 1999,
    name: 'Groom’s Tech',
    Rent: 500,
    display_img_urls: [
      'data:image/jpeg;base64,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',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 5,
    valid_until: '2025-09-15T00:00:00',
    low_quantity: 2,
    category: "Groom's Tech",
    description: 'Apple tech essentials for the groom.',
    buyers: 321,
    userRole: 'Groom',
  },

  // 21-40
  {
    pk: 1001,
    name: 'Bridal Beauty Kit',
    Rent: 250,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQevmmCvZPHavTaTHmFIktPNUcKdebwxfhWiA&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 30,
    valid_until: '2024-12-31T00:00:00',
    low_quantity: 20,
    category: "Bride's Beauty",
    description:
      'Complete beauty kit for brides, including makeup and skincare.',
    buyers: 128,
    userRole: 'Bride',
  },
  {
    pk: 1002,
    name: 'Groom’s Cologne Set - Chanel',
    Rent: 300,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqxYnA__I-sSFtOkKDgV-TK3y_P1gHb0sEtw&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 15,
    valid_until: '2025-06-01T00:00:00',
    low_quantity: 8,
    category: "Groom's Fragrance",
    description: 'Signature cologne set from Chanel for the groom.',
    buyers: 88,
    userRole: 'Groom',
  },
  {
    pk: 1003,
    name: 'Bridal Jewelry Set - Macy’s',
    Rent: 350,
    display_img_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYjQ_ZMkvLObrMZ8zP6tqjq1Bdn2p4ugh5eg&s',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 25,
    valid_until: '2025-03-30T00:00:00',
    low_quantity: 10,
    category: "Bride's Jewelry",
    description:
      'Luxurious jewelry set for brides, including necklace and earrings.',
    buyers: 185,
    userRole: 'Bride',
  },
];


