import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Shaki',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      mobileNo: '0771234567',
      city: 'jaffna',
      address: 'chunnakam,tellippali',
      isAdmin: true,
    },
    {
      name: 'John',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      mobileNo: '0777654321',
      city: 'jaffna',
      address: 'Allavetti,Tellippali',
      isAdmin: false,
    },
  ],
  products: [
    {
      //_id: '1',
      name: 'Wedding Decoration',
      slug: 'Decorations',
      category: 'Decorations',
      image: '/images/deco.jpg', // 679px × 829px
      price: 120000,
      countInStock: 10,
      brand: 'VJ-Creations',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality and stylish Stage Background',
    },
    {
      //_id: '2',
      name: 'Bridel Makeup',
      slug: 'Makeup',
      category: 'Makeup',
      image:
        'https://res.cloudinary.com/djq0pgqp3/image/upload/v1672891950/wcgs2w2alpvx0tfofhbp.jpg',
      price: 75000,
      countInStock: 0,
      brand: 'Evergreen Makeup',
      rating: 4.0,
      numReviews: 10,
      description:
        'Highly recommended makeup for Bridal, Bridal party makeup includes false lash application',
    },
    {
      //_id: '3',
      name: 'DJ Music',
      slug: 'DJ Music',
      category: 'DJ Music',
      image: '/images/djmusic.jpg',
      price: 65000,
      countInStock: 15,
      brand: 'DJBLACK',
      rating: 4.5,
      numReviews: 14,
      description:
        'Wedding DJs that knows how to create a magical night.entertain your gust to the best',
    },
    {
      //_id: '4',
      name: 'Wedding Hall',
      slug: 'Hall',
      category: 'Wedding Hall',
      image: '/images/weddinghall.jpg',
      price: 365000,
      countInStock: 5,
      brand: 'AMARI',
      rating: 4.5,
      numReviews: 10,
      description:
        'The Luxury Wedding Hall at Amari Jaffna Sri Lanka offers a grand and elegant venue for weddings',
    },
    {
      //_id: '5',
      name: 'Photography',
      slug: 'photography',
      category: 'photography',
      image:
        'https://res.cloudinary.com/djq0pgqp3/image/upload/v1678081179/c4ni3omgq4rtzpv1ztwt.jpg', // 679px × 829px
      price: 150000,
      countInStock: 10,
      brand: 'VJ-Creations',
      rating: 4.5,
      numReviews: 10,
      description:
        'Capturing moments with artistry and precision, our photography services at VJ-Creations ensure your memories are preserved in stunning detail.',
    },
    {
      //_id: '6',
      name: 'Birthday Card',
      slug: 'Birthday Card',
      category: 'Gifts',
      image:
        'https://res.cloudinary.com/djq0pgqp3/image/upload/v1672891485/o01sftk9al1zklohckwg.jpg',
      price: 250,
      countInStock: 20,
      brand: 'VJ-Creations',
      rating: 4.0,
      numReviews: 10,
      description:
        'Send your wishes to your loved ones along with this personalized and heart-warming handmade greeting card.  Your personal message will be hand-written inside of the card.',
    },
    {
      //_id: '7',
      name: 'Church Wedding Decoration',
      slug: 'wedding-deco',
      category: 'Decorations',
      image:
        'https://res.cloudinary.com/djq0pgqp3/image/upload/v1672891277/lmw8btfozn5zenkud0uq.jpg',
      price: 150000,
      countInStock: 15,
      brand: 'VJ-Creations',
      rating: 4.5,
      numReviews: 14,
      description:
        'Feeling for ever Floral Arrangement with a Tough of Elegance for Wedding & All Special Occasions like Church.',
    },
    {
      //_id: '8',
      name: 'Catering',
      slug: 'Catering',
      category: 'Catering',
      image:
        'https://res.cloudinary.com/djq0pgqp3/image/upload/v1678068498/qxpiecx5vdpkprdvezq2.jpg',
      price: 45000,
      countInStock: 5,
      brand: 'VJ-Creations',
      rating: 4.5,
      numReviews: 10,
      description:
        'Catering services provide food and beverage provisions for various events and occasions',
    },
  ],
};
export default data;
