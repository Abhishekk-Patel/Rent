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
    city: 'Bhopal' // Capital of Madhya Pradesh
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
    city: 'Guwahati' // Capital of Assam
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
    city: 'Chandigarh' // Capital of Punjab and Haryana
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
    city: 'Mumbai' // Capital of Maharashtra
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
    city: 'Bengaluru' // Capital of Karnataka
  },
  {
    pk: 1004,
    name: 'Groom’s Footwear',
    Rent: 150,
    display_img_urls: [
      'https://images.shaadisaga.com/shaadisaga_production/photos/pictures/000/476/587/new_medium/tsg.jpg?1532692507',
      'https://example.com/image2.jpg',
      'https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/15231024/2022/4/5/48837438-461f-492b-a4c3-6232cdeb71a51649135844639-House-of-Pataudi-Men-Beige--Gold-Toned-Woven-Design-Handcraf-1.jpg'
    ],
    currentImageIndex: 0,
    quantity: 12,
    valid_until: '2025-03-01T00:00:00',
    low_quantity: 6,
    category: "Groom's Accessories",
    description: 'Premium footwear for the groom on his special day.',
    buyers: 142,
    userRole: 'Groom',
    city: 'Kolkata' // Capital of West Bengal
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
    city: 'Hyderabad' // Capital of Telangana and Andhra Pradesh
  },

  // Groom's Wedding Tech
  {
    pk: 1999,
    name: 'Groom’s Tech',
    Rent: 500,
    display_img_urls: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMVFRUXGB8aGRgYGBgYGxogIRoXGBoaFxgYHSggHRolHRobIjEhJSkrLi4uGiA1ODMsNygtLisBCgoKDg0OFxAQFysdHR0tLS0tKy0tLSstKy0tLS0tLS0tKy0tLS0rLS0wLS0rLi0tKzItLTUtListLS0rKy0rLP/AABEIAQMAwgMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQMGAAIHAQj/xABEEAABAgMDCQUECgMAAQMFAAABAhEAAyEEEjEFQVFhcYGRobEGEyLB8DJCgtEHI1JicpKissLhFNLxUxUk4jNDY4Py/8QAGAEBAQEBAQAAAAAAAAAAAAAAAQACAwT/xAAhEQEBAAICAwEAAwEAAAAAAAAAAQIRAyESMUEEI1GBIv/aAAwDAQACEQMRAD8AucsVUNIJ4GvJR4RBNlsys6SeYw5c4KUllprS8BtBdD+e+IpySxBxz8f9geEcS1ObMPZJ1EhjuLcTG6kOkhqgEtyWBsU3GPJIvAg4VSfI7wXjdGAUdAUeFyZwFdsKLUoUEqSfdqNxp5wWa3CM7p30Wg/q5QTPlVBbSkj1r6wJLV9UzeyQr8pukcCjjEhpLktgoOBtr5J4mI5oeWCMRUcn+e6NyWFM2GsO4PUbo3kt4hmIvc6+Q4xIvkzLrtocbBX9riJppYD7tX5Hy5xDNF04eyrka/OJwBgNLA6qFPIjeIU3SQAWzVbVU/7DfGkyihx606j4RHtm0aC2x2I4KA4xupFKZqbqFO+gHxmAikKq+bHqFcq8IJtiHAPGvHoD8ML7IotSrYDT/wBDcIYWcum7izNsbzBHExIvOKjgU+PyWPPeIYWcAKpgqvrfANq8JCtBc7PZPK6r4TEshJAKRiiqdYx6U2iJHKBVtMQ2geHCqa7RgocH4x0ZaaO5R3icrIz6Z4wXq0rGpqS7O5XkgmG5lU0nNqT9XY+cq0VVilFQ02PUquZshphx6UJw5Cw+8HwrYOzUnSSBBtiF5ptt6Xp5pGNoZmZoav9Osmk5rPHoQcmh2FZr2qT6V3P4q27ch5ptTTKkjBwyfcqpt6J/eoX4apizI2uMppnqevD7wvh7UckwKwISuP/1Lvwz4jtq01Lq6pzk58kpItKyFIKp7NYybVg5lzNGdJW9tJziNlBFKx9nQOV1O62usgF5kgXcM8yVdndNpz2kPC5jmfr9zQnx81geKTgYymLq9U2r5+nYPHKF5km5Hnk6+kLQ8PxaDZxfiTPw2cxo6ICw4InGRz5ydwO4gV4vkv3mjg+qxjUgpQF0yfS1ODqDF7tZfsc7H9q0bGfL13q0Oec3P61OTB9b5r39EfmTxWo0N7PtyeaW3grmRwoHpPYrX3mmycfpms8zZn1V30z6k2amA5a4ehd6Hp5paOExdoz6XgZXhs8bh0sm/dwV5WqrL6yjyG8XqjLjy9k3PnlDdcbzyom3BzAKoA6D+1XYQjHohdaYz1z1p+fmuTxfzKhj7V5FZLMbp//2Q==',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ],
    currentImageIndex: 0,
    quantity: 7,
    valid_until: '2025-03-30T00:00:00',
    low_quantity: 3,
    category: "Groom's Tech",
    description: 'Advanced gadgets for the groom on his special day.',
    buyers: 45,
    userRole: 'Groom',
    city: 'Lucknow' // Capital of Uttar Pradesh
  }
];


