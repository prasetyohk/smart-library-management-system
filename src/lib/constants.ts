import { Category, Book, BookItem, Member, Loan } from '@/types';
import { OFFICIAL_DDC_CATEGORIES, resolveToDdcCategoryId } from './eddc';

// 10 Kategori Utama DDC Standar Perpustakaan SBTH (000 - 900)
export const CATEGORIES: Category[] = OFFICIAL_DDC_CATEGORIES;
export const DDC_CATEGORIES = OFFICIAL_DDC_CATEGORIES;

// Helper pencari kategori yang mendukung ID DDC baru maupun ID lama (cat-dongeng, dll)
export function findCategory(categories: Category[], categoryId?: string): Category {
  if (!categoryId) return categories[0] || OFFICIAL_DDC_CATEGORIES[0];
  const direct = categories.find((c) => c.id === categoryId);
  if (direct) return direct;
  const targetId = resolveToDdcCategoryId(categoryId);
  const matched = categories.find((c) => c.id === targetId || c.ddcCode === targetId.replace('ddc-', ''));
  return matched || categories[0] || OFFICIAL_DDC_CATEGORIES[0];
}


export const INITIAL_BOOKS: Book[] = [
  {
    id: 'b-01',
    isbn: '9789796103317',
    title: 'Dongeng Anak Sedunia',
    author: 'Tim Pustaka Widyatama',
    publisher: 'Pustaka Widyatama',
    publicationYear: 2022,
    categoryId: 'cat-dongeng',
    ageGroup: 'TK_A',
    pageCount: 160,
    bookLanguage: 'id',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 24,
    synopsis: 'Kumpulan dongeng klasik anak sedunia penuh pesan moral kebijaksanaan, kejujuran, dan imajinasi ceria.',
    coverImage: 'https://books.google.co.id/books/content?id=A7MVs4z21RcC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73oM-fpGSmCwlCzQNwnOeemQ9Fmeu7Efup9li4ctlbtpmcPp_Xnxwx43tfjg-nugk9HNfdDYD08xBZKFSodtwOCqMbg_9-Ladz3iNJRenkoDai_xoG94tZcoR_vrc5Z-bY9J1ft',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'b-02',
    isbn: '9786237794042',
    title: 'Smart Big Book: 365 Dongeng Pengantar Tidur',
    author: 'Fitri Nurul Aulia & Tim',
    publisher: 'Cikal Aksara',
    publicationYear: 2023,
    categoryId: 'cat-dongeng',
    ageGroup: 'TK_B',
    pageCount: 384,
    bookLanguage: 'id',
    physicalFormat: 'Hardcover',
    totalLoanCount: 31,
    synopsis: '365 kisah dongeng pilihan sehari-hari yang seru untuk menemani ananda tidur nyenyak penuh inspirasi.',
    coverImage: '',
    createdAt: '2024-01-02T08:00:00Z',
  },
  {
    id: 'b-03',
    isbn: '9786233191029',
    title: 'Kumpulan Cerita Dongeng Untuk Anak Usia Dini',
    author: 'Ardiyansyah Anan',
    publisher: 'Guepedia Kids',
    publicationYear: 2024,
    categoryId: 'cat-dongeng',
    ageGroup: 'TK_A',
    pageCount: 64,
    bookLanguage: 'id',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 19,
    synopsis: 'Cerita fabel dan dongeng interaktif untuk merangsang empati, bahasa, dan karakter budi pekerti usia emas.',
    coverImage: 'https://books.google.co.id/books/publisher/content?id=49tKEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70GclhSUAO4So7WX6UaKYpGEkpe2d_CJqgMgQT-e0bXGyL6LjR2lACro6RSogZHpS_KLRDUC53ezyzrUQNJRGBz9mHSbanS3w-ojgMb1d07yylmTXo3ZDrbsTkgVlBSKB1QkY_3',
    createdAt: '2024-01-03T08:00:00Z',
  },
  {
    id: 'b-04',
    isbn: '9789797528355',
    title: 'Jika Aku Jadi... Panda',
    author: 'Kak Adit & Tim Satwa',
    publisher: 'Kawan Pustaka',
    publicationYear: 2022,
    categoryId: 'cat-alam',
    ageGroup: 'PLAYGROUP',
    pageCount: 24,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 22,
    synopsis: 'Mengenal kehidupan beruang panda yang lucu di hutan bambu dengan ilustrasi menggemaskan.',
    coverImage: 'https://books.google.co.id/books/content?id=aA8oIrFbZ_IC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70Tjwy1WuZhbTYfUYYG7R_XAKarxPLpxTfB_i7MylAwLue1o2WT8glVUpWrAkrR1m3WGrZFOwwsf7I8JlNmykR33Qw-ZLHaNcTByatz5bRoyhI73d90vKnASPtCzf5g432g3Gu9',
    createdAt: '2024-01-04T08:00:00Z',
  },
  {
    id: 'b-05',
    isbn: '9786020524412',
    title: 'Anak-Anak Kampung Stroberi',
    author: 'Laksmi Manohara',
    publisher: 'Gramedia Pustaka Utama',
    publicationYear: 2023,
    categoryId: 'cat-alam',
    ageGroup: 'TK_B',
    pageCount: 48,
    bookLanguage: 'id',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 17,
    synopsis: 'Kisah persahabatan anak-anak di perkebunan buah stroberi yang asyik, saling tolong menolong dan jujur.',
    coverImage: '',
    createdAt: '2024-01-05T08:00:00Z',
  },
  {
    id: 'b-06',
    isbn: '9786020496580',
    title: 'Asyiknya Belajar Rukun Islam',
    author: 'Nurul Chomaria',
    publisher: 'Elex Media Komputindo',
    publicationYear: 2024,
    categoryId: 'cat-karakter',
    ageGroup: 'TK_A',
    pageCount: 32,
    bookLanguage: 'id',
    physicalFormat: 'Buku Aktivitas',
    totalLoanCount: 15,
    synopsis: 'Mengenal rukun Islam dan adab berbuat kebaikan sehari-hari secara menyenangkan untuk balita dan TK.',
    coverImage: 'https://books.google.co.id/books/publisher/content?id=UEyrDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70EuqShpP79uSf0YgstNcfFnDtU_ACSDOaHJ5MIbHOfI5xW_8AkxBytGuuL1-uFWplmqaW5XyGRDAI9B5kxzS9PpB2yfGcwxr_R9feS30zj7MSZxhu5cOOGPC04J7RKo8DpWU-t',
    createdAt: '2024-01-06T08:00:00Z',
  },
  {
    id: 'b-07',
    isbn: '9786022493426',
    title: 'Belajar Memasak bersama Bella (Bilingual Book)',
    author: 'Tim Erlangga for Kids',
    publisher: 'Erlangga for Kids',
    publicationYear: 2022,
    categoryId: 'cat-bahasa',
    ageGroup: 'TK_B',
    pageCount: 36,
    bookLanguage: 'bilingual',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 20,
    synopsis: 'Buku cerita dwibahasa (Indonesia & Inggris) memasak kue lezat bersama Bella dan teman-teman.',
    coverImage: 'https://books.google.co.id/books/publisher/content?id=wUJGDwAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70G-vdvzVFgTvX_QqVNcaDUtJI1JcM52WAo9CoLn8p0tTjeCDeG7tztU61Z16rtNqD1iJqOzuS4T2MVgtETc_uZzF4wFXl-wtnblZ-2I1oFF44IvoOJiXJoyafcp98c946nskQq',
    createdAt: '2024-01-07T08:00:00Z',
  },
  {
    id: 'b-08',
    isbn: '9789790158962',
    title: 'Aku Ingin Menjadi: Dokter',
    author: 'Rien Nur Azizah',
    publisher: 'Erlangga for Kids',
    publicationYear: 2023,
    categoryId: 'cat-karakter',
    ageGroup: 'PLAYGROUP',
    pageCount: 28,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 18,
    synopsis: 'Mengenal profesi dokter yang mulia, merawat orang sakit dengan penuh kasih dan keberanian.',
    coverImage: 'https://books.google.co.id/books/publisher/content?id=rgZNBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70IrE0hPpZ8qPxPx_hQwVcimDzatcFZ38IDUa261-YDft0u4_C8l-P0lM6MBSlN9T02UggHQgljRNxXYJ8pSeSTM4UN1H-GUoli23AqTCTJBQzTYxX6n8YVWGrsZtdWVke_s2w3',
    createdAt: '2024-01-08T08:00:00Z',
  },
  {
    id: 'b-09',
    isbn: '9786232543973',
    title: 'Seri Cerita Balita: Saat Aku Senang, Marah, Sedih, Takut',
    author: 'Rien Nur Azizah',
    publisher: 'Mizan Pelangi',
    publicationYear: 2024,
    categoryId: 'cat-karakter',
    ageGroup: 'PLAYGROUP',
    pageCount: 20,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 16,
    synopsis: 'Membantu anak mengenali dan mengekspresikan emosi senang, sedih, takut, dan marah dengan tenang.',
    coverImage: '',
    createdAt: '2024-01-09T08:00:00Z',
  },
  {
    id: 'b-10',
    isbn: '9786232542952',
    title: 'Seri Cerita Balita: Aku Mau Menolong',
    author: 'Ali Muakhir',
    publisher: 'Mizan Pelangi',
    publicationYear: 2022,
    categoryId: 'cat-karakter',
    ageGroup: 'TK_A',
    pageCount: 20,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 13,
    synopsis: 'Kisah balita yang gemar menolong teman, merapikan mainan, dan menyayangi sesama di sekolah.',
    coverImage: '',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'b-11',
    isbn: '9789793391120',
    title: 'Seri Cerita Balita: Aku Sayang Ayah',
    author: 'Eka Wardhana',
    publisher: 'DAR! Mizan',
    publicationYear: 2023,
    categoryId: 'cat-karakter',
    ageGroup: 'PLAYGROUP',
    pageCount: 20,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 15,
    synopsis: 'Ungkapan kasih sayang tulus ananda kepada ayah tercinta yang selalu menemani bermain dan belajar.',
    coverImage: 'https://books.google.co.id/books/content?id=aby6Maiv7SgC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE7295xsZsEHPQs_IlFrnYtkONaMJX-rAFNjWHd3hy1K2wOPIOJQqJP5-XtsiNej1ACpCQJDnh6H_S1-OVWsxqXLWELiPihf_AAgMdf5G4HvopnmLp3vySuSb5qOF0IlkvQumjQPg',
    createdAt: '2024-01-11T08:00:00Z',
  },
  {
    id: 'b-12',
    isbn: '9786022428501',
    title: 'Seri Cerita Balita: Aku Sayang Paman',
    author: 'Eka Wardhana',
    publisher: 'DAR! Mizan',
    publicationYear: 2024,
    categoryId: 'cat-karakter',
    ageGroup: 'PLAYGROUP',
    pageCount: 20,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 11,
    synopsis: 'Kisah petualangan seru bersama paman saat liburan akhir pekan di desa yang asri.',
    coverImage: '',
    createdAt: '2024-01-12T08:00:00Z',
  },
  {
    id: 'b-13',
    isbn: '9786024206475',
    title: 'Seri Cerita Balita: Mengenal Perbandingan',
    author: 'Tim Pelangi Mizan',
    publisher: 'Mizan Pelangi',
    publicationYear: 2022,
    categoryId: 'cat-aktivitas',
    ageGroup: 'PLAYGROUP',
    pageCount: 24,
    bookLanguage: 'id',
    physicalFormat: 'Boardbook',
    totalLoanCount: 14,
    synopsis: 'Belajar konsep perbandingan besar-kecil, tinggi-rendah, dan panjang-pendek dengan gambar ceria.',
    coverImage: '',
    createdAt: '2024-01-13T08:00:00Z',
  },
  {
    id: 'b-14',
    isbn: '9786235210773',
    title: 'Seri Anak Terampil: Aku Bisa Berbahasa',
    author: 'Heryanto',
    publisher: 'Erlangga for Kids',
    publicationYear: 2023,
    categoryId: 'cat-aktivitas',
    ageGroup: 'TK_A',
    pageCount: 32,
    bookLanguage: 'id',
    physicalFormat: 'Buku Aktivitas',
    totalLoanCount: 12,
    synopsis: 'Latihan kosakata dasar dan berbahasa santun untuk melatih komunikasi efektif anak usia 4-5 tahun.',
    coverImage: '',
    createdAt: '2024-01-14T08:00:00Z',
  },
  {
    id: 'b-15',
    isbn: '9786235211596',
    title: 'Seri Anak Cerdas dan Ceria: Bermain Huruf',
    author: 'Tim Anak Bangsa',
    publisher: 'Erlangga for Kids',
    publicationYear: 2024,
    categoryId: 'cat-aktivitas',
    ageGroup: 'PLAYGROUP',
    pageCount: 32,
    bookLanguage: 'id',
    physicalFormat: 'Buku Aktivitas',
    totalLoanCount: 16,
    synopsis: 'Permainan mencocokkan huruf alfabet dan mengenal bunyi kata pertama dengan ceria.',
    coverImage: '',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'b-16',
    isbn: '9786235212166',
    title: 'Ide Pembelajaran Sains Asyik untuk Anak',
    author: 'Izzul Fitriyah & Amar Abdilla',
    publisher: 'Erlangga for Kids',
    publicationYear: 2022,
    categoryId: 'cat-alam',
    ageGroup: 'TK_B',
    pageCount: 48,
    bookLanguage: 'id',
    physicalFormat: 'Buku Aktivitas',
    totalLoanCount: 12,
    synopsis: 'Eksperimen sains sederhana tentang air, udara, dan warna untuk menumbuhkan rasa ingin tahu.',
    coverImage: '',
    createdAt: '2024-01-16T08:00:00Z',
  },
  {
    id: 'b-17',
    isbn: '9786235212487',
    title: 'Seri Cerita Bergambar: Tanduk Paling Indah',
    author: 'Waskitaningtyas (Tyas KW)',
    publisher: 'Erlangga for Kids',
    publicationYear: 2023,
    categoryId: 'cat-dongeng',
    ageGroup: 'TK_A',
    pageCount: 24,
    bookLanguage: 'id',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 15,
    synopsis: 'Cerita indah tentang rusa bertanduk elok yang belajar bersyukur dan rendah hati kepada sesama.',
    coverImage: '',
    createdAt: '2024-01-17T08:00:00Z',
  },
  {
    id: 'b-18',
    isbn: '9786235210674',
    title: 'Seri Anak Spesial: Kiki yang Hebat',
    author: 'Imam Setiawan',
    publisher: 'Erlangga for Kids',
    publicationYear: 2024,
    categoryId: 'cat-karakter',
    ageGroup: 'TK_B',
    pageCount: 28,
    bookLanguage: 'id',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 9,
    synopsis: 'Kisah inspiratif tentang anak yang mandiri, berani mencoba hal baru, dan pantang menyerah.',
    coverImage: '',
    createdAt: '2024-01-18T08:00:00Z',
  },
  {
    id: 'b-19',
    isbn: '9786235211879',
    title: 'Legenda dan Dongeng Tradisi Nusantara',
    author: 'Padmasariwiningsih',
    publisher: 'Erlangga for Kids',
    publicationYear: 2022,
    categoryId: 'cat-dongeng',
    ageGroup: 'TK_B',
    pageCount: 32,
    bookLanguage: 'bilingual',
    physicalFormat: 'Cerita Bergambar',
    totalLoanCount: 18,
    synopsis: 'Dongeng legenda nusantara yang kaya akan pesan moral persatuan, rasa hormat, dan cinta tanah air.',
    coverImage: '',
    createdAt: '2024-01-19T08:00:00Z',
  },
  {
    id: 'b-20',
    isbn: '9786235211725',
    title: 'Budaya Lokal Kuatkan Karakter Anak Usia Dini',
    author: 'Tim PP HIMPAUDI',
    publisher: 'Erlangga for Kids',
    publicationYear: 2023,
    categoryId: 'cat-ensiklopedia',
    ageGroup: 'TK_B',
    pageCount: 56,
    bookLanguage: 'id',
    physicalFormat: 'Hardcover',
    totalLoanCount: 14,
    synopsis: 'Mengenal ragam busana, tarian, dan kebiasaan baik nusantara untuk memperkuat karakter anak.',
    coverImage: '',
    createdAt: '2024-01-20T08:00:00Z',
  },
];

export const INITIAL_BOOK_ITEMS: BookItem[] = [
  // 1-12: Aset Pembelian Sekolah (Anggaran / BOS / Kas Sekolah) -> ~Rp 600.000
  {
    id: 'item-1',
    bookId: 'b-01',
    itemBarcode: 'SBTH-B-00101',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak A (Dongeng) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-2',
    bookId: 'b-01',
    itemBarcode: 'SBTH-B-00102',
    copyNumber: 2,
    status: 'BORROWED',
    conditionNote: 'Sedang dipinjam siswa',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak A (Dongeng) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-3',
    bookId: 'b-01',
    itemBarcode: 'SBTH-B-00103',
    copyNumber: 3,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak A (Dongeng) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-4',
    bookId: 'b-02',
    itemBarcode: 'SBTH-B-00104',
    copyNumber: 1,
    status: 'BORROWED',
    conditionNote: 'Sedang dipinjam siswa',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak A (Dongeng) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-5',
    bookId: 'b-02',
    itemBarcode: 'SBTH-B-00105',
    copyNumber: 2,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak A (Dongeng) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-6',
    bookId: 'b-02',
    itemBarcode: 'SBTH-B-00106',
    copyNumber: 3,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak A (Dongeng) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-7',
    bookId: 'b-03',
    itemBarcode: 'SBTH-B-00107',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 55000,
    shelfLocation: 'Rak A (Dongeng) - Baris 3',
    labelPrinted: true,
  },
  {
    id: 'item-8',
    bookId: 'b-03',
    itemBarcode: 'SBTH-B-00108',
    copyNumber: 2,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 55000,
    shelfLocation: 'Rak A (Dongeng) - Baris 3',
    labelPrinted: true,
  },
  {
    id: 'item-9',
    bookId: 'b-03',
    itemBarcode: 'SBTH-B-00109',
    copyNumber: 3,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 55000,
    shelfLocation: 'Rak A (Dongeng) - Baris 3',
    labelPrinted: true,
  },
  {
    id: 'item-10',
    bookId: 'b-04',
    itemBarcode: 'SBTH-B-00110',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak B (Sains & Alam) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-11',
    bookId: 'b-04',
    itemBarcode: 'SBTH-B-00111',
    copyNumber: 2,
    status: 'DAMAGED',
    conditionNote: 'Halaman 4 sobek saat dibaca, belum diganti',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Meja Perawatan Pustakawan',
    labelPrinted: true,
  },
  {
    id: 'item-12',
    bookId: 'b-04',
    itemBarcode: 'SBTH-B-00112',
    copyNumber: 3,
    status: 'IN_REPAIR',
    conditionNote: 'Sampul lepas, sedang dilem ulang guru kelas (belum dihapus dari aset)',
    acquisitionDate: '2024-01-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 55000,
    shelfLocation: 'Meja Perbaikan Guru',
    labelPrinted: true,
  },

  // 13-18: Aset Hibah / Sumbangan Orang Tua Murid (Wall of Donors) -> ~Rp 240.000 (Mendukung Rp 0!)
  {
    id: 'item-13',
    bookId: 'b-05',
    itemBarcode: 'SBTH-B-00113',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Donasi orang tua murid kondisi sangat baik',
    acquisitionDate: '2024-02-10',
    source: 'SUMBANGAN_ORTU',
    acquisitionSource: 'SUMBANGAN_ORTU',
    donorName: 'Orang Tua Budi (TK-A)',
    priceValue: 50000,
    shelfLocation: 'Rak B (Sains & Alam) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-14',
    bookId: 'b-05',
    itemBarcode: 'SBTH-B-00114',
    copyNumber: 2,
    status: 'AVAILABLE',
    conditionNote: 'Donasi sukarela orang tua murid',
    acquisitionDate: '2024-02-10',
    source: 'SUMBANGAN_ORTU',
    acquisitionSource: 'SUMBANGAN_ORTU',
    donorName: 'Orang Tua Jessica (TK-B)',
    priceValue: 50000,
    shelfLocation: 'Rak B (Sains & Alam) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-15',
    bookId: 'b-06',
    itemBarcode: 'SBTH-B-00115',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Donasi akhir semester orang tua',
    acquisitionDate: '2024-02-14',
    source: 'SUMBANGAN_ORTU',
    acquisitionSource: 'SUMBANGAN_ORTU',
    donorName: 'Ibu Cindy (Nursery)',
    priceValue: 55000,
    shelfLocation: 'Rak C (Aktivitas & Membaca) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-16',
    bookId: 'b-06',
    itemBarcode: 'SBTH-B-00116',
    copyNumber: 2,
    status: 'BORROWED',
    conditionNote: 'Sedang dipinjam siswa',
    acquisitionDate: '2024-02-14',
    source: 'SUMBANGAN_ORTU',
    acquisitionSource: 'SUMBANGAN_ORTU',
    donorName: 'Keluarga Kevin (TK-B)',
    priceValue: 55000,
    shelfLocation: 'Rak C (Aktivitas & Membaca) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-17',
    bookId: 'b-07',
    itemBarcode: 'SBTH-B-00117',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Sumbangan buku cerita anak dwibahasa',
    acquisitionDate: '2024-03-01',
    source: 'SUMBANGAN_ORTU',
    acquisitionSource: 'SUMBANGAN_ORTU',
    donorName: 'Bunda Aurel (Toddler)',
    priceValue: 30000,
    shelfLocation: 'Rak Pink F (Trilingual SBTH) - Baris 1',
    labelPrinted: false, // Belum dicetak label (untuk uji filter label)
  },
  {
    id: 'item-18',
    bookId: 'b-07',
    itemBarcode: 'SBTH-B-00118',
    copyNumber: 2,
    status: 'AVAILABLE',
    conditionNote: 'Hibah sukarela orang tua murid (Taksiran nilai Rp 0)',
    acquisitionDate: '2024-03-01',
    source: 'SUMBANGAN_ORTU',
    acquisitionSource: 'SUMBANGAN_ORTU',
    donorName: 'Ayah Dylan (TK-A)',
    priceValue: 0, // Nilai 0 valid untuk audit yayasan
    shelfLocation: 'Rak Pink F (Trilingual SBTH) - Baris 1',
    labelPrinted: false, // Belum dicetak label (untuk uji filter label)
  },
  {
    id: 'item-19',
    bookId: 'b-08',
    itemBarcode: 'SBTH-B-00119',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-05',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 48000,
    shelfLocation: 'Rak Merah D (Karakter & Nilai) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-20',
    bookId: 'b-09',
    itemBarcode: 'SBTH-B-00120',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-05',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak Merah D (Karakter & Nilai) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-21',
    bookId: 'b-10',
    itemBarcode: 'SBTH-B-00121',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-05',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak Merah D (Karakter & Nilai) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-22',
    bookId: 'b-11',
    itemBarcode: 'SBTH-B-00122',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-05',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak Merah D (Karakter & Nilai) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-23',
    bookId: 'b-12',
    itemBarcode: 'SBTH-B-00123',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-05',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak Merah D (Karakter & Nilai) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-24',
    bookId: 'b-13',
    itemBarcode: 'SBTH-B-00124',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-10',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak Biru C (Aktivitas & Membaca) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-25',
    bookId: 'b-14',
    itemBarcode: 'SBTH-B-00125',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-10',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak Pink F (Trilingual SBTH) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-26',
    bookId: 'b-15',
    itemBarcode: 'SBTH-B-00126',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-10',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak Biru C (Aktivitas & Membaca) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-27',
    bookId: 'b-16',
    itemBarcode: 'SBTH-B-00127',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-12',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 65000,
    shelfLocation: 'Rak Ungu E (Sains & Ensiklopedia) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-28',
    bookId: 'b-17',
    itemBarcode: 'SBTH-B-00128',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-12',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 45000,
    shelfLocation: 'Rak Kuning B (Dongeng & Fabel) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-29',
    bookId: 'b-18',
    itemBarcode: 'SBTH-B-00129',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 48000,
    shelfLocation: 'Rak Merah D (Karakter & Nilai) - Baris 1',
    labelPrinted: true,
  },
  {
    id: 'item-30',
    bookId: 'b-19',
    itemBarcode: 'SBTH-B-00130',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 50000,
    shelfLocation: 'Rak Kuning B (Dongeng & Fabel) - Baris 2',
    labelPrinted: true,
  },
  {
    id: 'item-31',
    bookId: 'b-20',
    itemBarcode: 'SBTH-B-00131',
    copyNumber: 1,
    status: 'AVAILABLE',
    conditionNote: 'Kondisi prima siap dipinjam',
    acquisitionDate: '2024-03-15',
    source: 'BELI_SEKOLAH',
    acquisitionSource: 'BELI_SEKOLAH',
    priceValue: 65000,
    shelfLocation: 'Rak Ungu E (Sains & Ensiklopedia) - Baris 2',
    labelPrinted: true,
  },
];


export const INITIAL_MEMBERS: Member[] = [
  // 1. TODDLER (Kelas A, B, C, D)
  {
    id: 'm-toddler-01',
    memberCode: 'SBTH-M-0010',
    name: 'Kenzi Arkanendra',
    type: 'STUDENT',
    classGroup: 'Toddler A',
    gradeLevel: 'TODDLER',
    classLetter: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&q=80',
    parentName: 'Mama Arka',
    parentPhone: '081234567888',
    maxLoanLimit: 2,
    username: 'kenzi',
    password: '123',
  },
  {
    id: 'm-toddler-02',
    memberCode: 'SBTH-M-0011',
    name: 'Mikaela Joy',
    type: 'STUDENT',
    classGroup: 'Toddler B',
    gradeLevel: 'TODDLER',
    classLetter: 'B',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80',
    parentName: 'Papa Joy',
    parentPhone: '081234567889',
    maxLoanLimit: 2,
    username: 'mikaela',
    password: '123',
  },

  // 2. NURSERY (Kelas A, B, C, D)
  {
    id: 'm-nursery-01',
    memberCode: 'SBTH-M-0012',
    name: 'Oliver Samuel',
    type: 'STUDENT',
    classGroup: 'Nursery A',
    gradeLevel: 'NURSERY',
    classLetter: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fb5597d5a5?w=150&q=80',
    parentName: 'Bunda Samuel',
    parentPhone: '081234567890',
    maxLoanLimit: 2,
    username: 'oliver',
    password: '123',
  },

  // 3. TK-A (Kelas A, B, C, D)
  {
    id: 'm-01',
    memberCode: 'SBTH-M-0015',
    name: 'Alvaro Keandra Pratama',
    type: 'STUDENT',
    classGroup: 'TK-A A',
    gradeLevel: 'TK_A',
    classLetter: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&q=80',
    parentName: 'Bunda Diana Pratama',
    parentPhone: '081234567891',
    maxLoanLimit: 2,
    username: 'alvaro',
    password: '123',
  },
  {
    id: 'm-02',
    memberCode: 'SBTH-M-0016',
    name: 'Aisyah Humaira Putri',
    type: 'STUDENT',
    classGroup: 'TK-A B',
    gradeLevel: 'TK_A',
    classLetter: 'B',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80',
    parentName: 'Mama Fatimah',
    parentPhone: '081398765432',
    maxLoanLimit: 2,
    username: 'aisyah',
    password: '123',
  },

  // 4. TK-B (Kelas A, B, C, D)
  {
    id: 'm-03',
    memberCode: 'SBTH-M-0021',
    name: 'Rayyan Bilal Nugroho',
    type: 'STUDENT',
    classGroup: 'TK-B A',
    gradeLevel: 'TK_B',
    classLetter: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fb5597d5a5?w=150&q=80',
    parentName: 'Ayah Teguh Nugroho',
    parentPhone: '085712344321',
    maxLoanLimit: 2,
    username: 'rayyan',
    password: '123',
  },
  {
    id: 'm-04',
    memberCode: 'SBTH-M-0022',
    name: 'Nayla Shakila Azzahra',
    type: 'STUDENT',
    classGroup: 'TK-B B',
    gradeLevel: 'TK_B',
    classLetter: 'B',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&q=80',
    parentName: 'Ibu Zahra',
    parentPhone: '087812984567',
    maxLoanLimit: 2,
    username: 'nayla',
    password: '123',
  },

  // 5. GURU & TENAGA PENDIDIK (Bisa Pinjam Hingga 10 Buku)
  {
    id: 'm-guru-01',
    memberCode: 'SBTH-G-0001',
    name: 'Ms. Kriss (Pustakawan & Guru)',
    type: 'TEACHER',
    classGroup: 'Guru Toddler & Nursery',
    gradeLevel: 'TEACHER',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    parentName: 'Staff Guru SBTH',
    parentPhone: '08157773256',
    maxLoanLimit: 10,
    username: 'ms_kriss',
    password: '123',
  },
  {
    id: 'm-guru-02',
    memberCode: 'SBTH-G-0002',
    name: 'Bu Guru Rina, S.Pd (Wali Kelas TK-B)',
    type: 'TEACHER',
    classGroup: 'Guru TK-B',
    gradeLevel: 'TEACHER',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&q=80',
    parentName: 'Staff Guru SBTH',
    parentPhone: '081392828888',
    maxLoanLimit: 10,
    username: 'guru_rina',
    password: '123',
  },

  // 6. POJOK BACA KELAS
  {
    id: 'm-05',
    memberCode: 'SBTH-C-TKA1',
    name: 'Pojok Baca: Kelas TK-A A',
    type: 'CLASSROOM',
    classGroup: 'TK-A A',
    gradeLevel: 'TK_A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&q=80',
    parentName: 'Wali Kelas: Bu Guru Sarah, S.Pd.',
    parentPhone: '081288889999',
    maxLoanLimit: 15,
  },

  // 7. ARSIP ALUMNI (Sudah Lulus dari TK-B, Riwayat Aman Tersimpan)
  {
    id: 'm-alumni-01',
    memberCode: 'SBTH-ALUMNI-2024-001',
    name: 'Kenzo Rafisqy (Lulus TK-B 2024/2025)',
    type: 'STUDENT',
    classGroup: 'Alumni TK-B 2024/2025',
    gradeLevel: 'ALUMNI',
    academicYear: '2024/2025',
    status: 'GRADUATED',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&q=80',
    parentName: 'Mama Kenzo',
    parentPhone: '081211112222',
    maxLoanLimit: 0,
  },
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan-101',
    memberId: 'm-01', // Alvaro
    loanDate: '2026-10-10',
    dueDate: '2026-10-17',
    status: 'ACTIVE',
    handledBy: 'Bu Guru Sarah (Pustakawan)',
    notes: 'Dipinjam untuk dibaca bersama Bunda di rumah',
    items: [
      {
        id: 'li-001',
        loanId: 'loan-101',
        bookItemId: 'item-2',
        itemBarcode: 'SBTH-B-00102',
        bookTitle: 'Dongeng Anak Sedunia',
        returnDate: null,
      },
    ],
  },
  {
    id: 'loan-102',
    memberId: 'm-03', // Rayyan
    loanDate: '2026-10-05',
    dueDate: '2026-10-12', // Telat 3 hari dari waktu sekarang
    status: 'OVERDUE',
    handledBy: 'Bu Guru Sarah (Pustakawan)',
    notes: 'Perlu diingatkan via WhatsApp orang tua',
    items: [
      {
        id: 'li-002',
        loanId: 'loan-102',
        bookItemId: 'item-4',
        itemBarcode: 'SBTH-B-00104',
        bookTitle: 'Smart Big Book: 365 Dongeng Pengantar Tidur',
        returnDate: null,
      },
    ],
  },
  {
    id: 'loan-103',
    memberId: 'm-05', // Pojok Baca TK-A1
    loanDate: '2026-10-14',
    dueDate: '2026-10-21',
    status: 'ACTIVE',
    handledBy: 'Bu Guru Sarah (Pustakawan)',
    notes: 'Koleksi rotasi mingguan pojok baca kelas TK-A A',
    items: [
      {
        id: 'li-003',
        loanId: 'loan-103',
        bookItemId: 'item-8',
        itemBarcode: 'SBTH-B-00108',
        bookTitle: 'Jika Aku Jadi... Panda',
        returnDate: null,
      },
    ],
  },
];

export const INITIAL_FINES_AND_DONATIONS: import('@/types').FineAndDonation[] = [
  {
    id: 'fine-001',
    memberId: 'm-01', // Alvaro
    type: 'DENDA_TERLAMBAT',
    amount: 15000,
    paidStatus: 'PAID',
    paidAt: '2026-10-14',
    createdAt: '2026-10-14',
    notes: 'Denda keterlambatan 3 hari (buku Kancil)',
  },
  {
    id: 'fine-002',
    memberId: 'm-03', // Rayyan
    type: 'DENDA_TERLAMBAT',
    amount: 10000,
    paidStatus: 'UNPAID',
    createdAt: '2026-10-13',
    notes: 'Keterlambatan buku Jerapah (menunggu jemputan ananda)',
  },
  {
    id: 'fine-003',
    memberId: 'm-02', // Aisyah
    type: 'GANTI_RUSAK',
    amount: 35000,
    paidStatus: 'PAID',
    paidAt: '2026-10-11',
    createdAt: '2026-10-11',
    notes: 'Ganti rugi sampul buku robek tidak sengaja oleh adik di rumah',
  },
  {
    id: 'fine-004',
    memberId: 'm-04', // Nayla
    type: 'SUMBANGAN_TUNAI',
    amount: 50000,
    paidStatus: 'PAID',
    paidAt: '2026-10-09',
    createdAt: '2026-10-09',
    notes: 'Donasi sukarela pengadaan buku cerita baru dari Bunda Nayla',
  },
];

export const DEFAULT_TELEGRAM_CONFIG: import('@/types').TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
  autoWeekly: true,
  autoMonthly: true,
  googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/1sbth-tk-library-master-backup-2026/edit',
  lastBackupAt: '2026-10-14 15:00:00 WIB',
  lastStatus: 'Idle (Siap Digunakan)',
};

export const DEFAULT_SCHOOL_PROFILE: import('@/types').SchoolProfile = {
  name: 'KB-TK Bhakti Tunas Harapan (SBTH) Magelang',
  tagline: '"Be Smart, Be Kind" 好好学习，天天向上',
  address: 'Jl. Jendral Sudirman No. 68A, Kelurahan Magersari, Kecamatan Magelang Selatan, Kota Magelang, Provinsi Jawa Tengah',
  phone: '0815-7773-256 (Ms. Kriss) / +62 813-9282-8888',
  instagram: '@sbth.kbtk',
  facebook: 'Kb -Tk Bhakti Tunas Harapan',
  logoUrl: '/logo_sbth.png',
  headmasterName: 'Kepala Sekolah KB-TK SBTH', // Editable oleh pustakawan
  headmasterNip: '-',
  librarianName: 'Pustakawan SBTH',           // Editable oleh pustakawan
  librarianNip: 'Perpustakaan SBTH Magelang',
  enableFinanceModule: false, // Default OFF sesuai permintaan sekolah (denda bebas dinonaktifkan)
  lastStockOpnameDate: '2026-10-15',
  lastStockOpnameSummary: '18 Eksemplar Fisik Terverifikasi (100% Sesuai)',
};

export const DEFAULT_SHELVES: import('@/types').ShelfLocationItem[] = [
  {
    id: 'shelf-a',
    code: 'Rak A',
    name: 'Dongeng & Cerita Bergambar',
    colorHex: '#F59E0B',
    colorName: 'Kuning',
    rowStructure: 'Baris 1 (Atas) s/d Baris 4 (Bawah)',
    capacity: 50,
    description: 'Rak khusus fabel, dongeng nusantara, dan kisah bergambar TK.',
  },
  {
    id: 'shelf-b',
    code: 'Rak B',
    name: 'Sains, Hewan & Dinosaurus',
    colorHex: '#10B981',
    colorName: 'Hijau',
    rowStructure: 'Baris 1 s/d Baris 4',
    capacity: 50,
    description: 'Rak alam, fauna, tata surya, dan eksperimen cilik anak.',
  },
  {
    id: 'shelf-c',
    code: 'Rak C',
    name: 'Membaca, Fonik, Menulis & Huruf',
    colorHex: '#3B82F6',
    colorName: 'Biru',
    rowStructure: 'Baris 1 s/d Baris 4',
    capacity: 40,
    description: 'Buku aktivitas pra-membaca, fonik suku kata, dan maze.',
  },
  {
    id: 'shelf-d',
    code: 'Rak D',
    name: 'Karakter, Moral & Budi Pekerti',
    colorHex: '#EF4444',
    colorName: 'Merah',
    rowStructure: 'Baris 1 s/d Baris 3',
    capacity: 35,
    description: 'Buku pembentukan akhlak, empati, adab, dan doa harian.',
  },
  {
    id: 'shelf-e',
    code: 'Rak E',
    name: 'Bahasa Mandarin & Bilingual',
    colorHex: '#EC4899',
    colorName: 'Pink',
    rowStructure: 'Baris 1 s/d Baris 3',
    capacity: 30,
    description: 'Koleksi trilingual SBTH (Mandarin - English - Indonesia).',
  },
  {
    id: 'shelf-f',
    code: 'Rak F',
    name: 'Ensiklopedia & Referensi Guru',
    colorHex: '#8B5CF6',
    colorName: 'Ungu',
    rowStructure: 'Baris 1 s/d Baris 2',
    capacity: 25,
    description: 'Buku rujukan ilmu pengetahuan tebal dan panduan mengajar.',
  },
];

export const DEFAULT_WHATSAPP_TEMPLATES: import('@/types').WhatsAppReminderTemplate[] = [
  {
    id: 'wa-tpl-1',
    title: 'Pengingat H-1 Jatuh Tempo',
    type: 'DUE_REMINDER',
    templateText: `Halo Ayah/Bunda dari ananda *{nama_siswa}* ({kelas}) 👋📚\n\nKami dari *Perpustakaan KB-TK Bhakti Tunas Harapan (SBTH)* mengingatkan bahwa buku cerita yang dipinjam:\n📖 *"{judul_buku}"*\nakan jatuh tempo pada *{jatuh_tempo}*.\n\nMohon ananda dapat membawa kembali bukunya ke sekolah besok agar dapat ditukar dengan petualangan cerita baru. Terima kasih banyak atas pendampingan literasi di rumah! 🙏✨`,
  },
  {
    id: 'wa-tpl-2',
    title: 'Pemberitahuan Terlambat Pengembalian',
    type: 'OVERDUE',
    templateText: `Halo Ayah/Bunda dari ananda *{nama_siswa}* ({kelas}) 🙏\n\nBuku perpustakaan SBTH berikut tercatat melewati batas waktu pengembalian ({terlambat_hari} hari):\n📖 *"{judul_buku}"*\nJatuh tempo: *{jatuh_tempo}*\n\nMohon bantuan Ayah/Bunda agar buku dapat dibawa kembali ke sekolah besok ya. Jika ananda masih ingin membaca, buku dapat diperpanjang di meja sirkulasi perpustakaan. Terima kasih! 🌸`,
  },
  {
    id: 'wa-tpl-3',
    title: 'Konfirmasi Peminjaman Baru',
    type: 'NEW_LOAN',
    templateText: `Semangat Pagi Ayah/Bunda ananda *{nama_siswa}* ({kelas})! 🎉\n\nHari ini ananda telah meminjam buku cerita baru dari Perpustakaan SBTH:\n📖 *"{judul_buku}"*\nBatas waktu pengembalian: *{jatuh_tempo}*\n\nSelamat membaca bersama ananda di rumah! 📚✨`,
  },
  {
    id: 'wa-tpl-4',
    title: 'Terima Kasih Buku Kembali',
    type: 'RETURN_THANKS',
    templateText: `Terima kasih banyak Ayah/Bunda ananda *{nama_siswa}* ({kelas})! 🌟\n\nBuku perpustakaan *"{judul_buku}"* telah dikembalikan dalam kondisi baik. Ananda hebat sudah belajar tertib dan bertanggung jawab! Silakan pilih buku cerita seru berikutnya di perpustakaan sekolah. 🌈`,
  },
];

export const DEFAULT_LIBRARIANS: import('@/types').Librarian[] = [
  {
    id: 'lib-01',
    name: 'Ms. Kriss (Pustakawan Utama)',
    username: 'ms_kriss',
    role: 'ADMIN',
    pin: 'sbth2026',
    phone: '081234567890',
    createdAt: '2024-01-01',
  },
  {
    id: 'lib-02',
    name: 'Bunda Aisyah Nuraini',
    username: 'aisyah_perpus',
    role: 'LIBRARIAN',
    pin: '5678',
    phone: '081398765432',
    createdAt: '2024-02-15',
  },
];

export const DEFAULT_REMINDER_SCHEDULE: import('@/types').ReminderSchedule = {
  enabled: true,
  dayOfWeek: 'FRIDAY',
  timeStr: '14:30',
  targetChannel: 'BOTH',
  reportType: 'ALL',
  lastRunAt: '2026-10-10 14:30:00',
};

export const DEFAULT_LOAN_RULES: import('@/types').LoanRules = {
  finePerDay: 500, // Rp 500 per hari per buku
  loanDurationDays: 7, // 7 hari peminjaman default siswa
  maxBooksLimit: 2, // 2 buku per siswa
  maxRenewals: 1, // maksimal 1x perpanjangan
  renewalDurationDays: 7, // durasi perpanjangan 7 hari
  allowedDurations: [3, 7, 14, 30],
  reservationExpiryHours: 24, // 24 jam batas ambil buku reservasi
  memberTypeRules: [
    {
      memberType: 'STUDENT',
      label: 'Siswa / Murid TK',
      maxBooks: 2,
      loanDurationDays: 7,
      maxRenewals: 1,
    },
    {
      memberType: 'TEACHER',
      label: 'Guru & Tenaga Pendidik',
      maxBooks: 5,
      loanDurationDays: 14,
      maxRenewals: 2,
    },
    {
      memberType: 'CLASSROOM',
      label: 'Pojok Baca Sentra / Kelas',
      maxBooks: 15,
      loanDurationDays: 30,
      maxRenewals: 3,
    },
  ],
  reminderDayBefore: 1, // Dikirim pada hari ke-6 (1 hari sebelum jatuh tempo)
  reminderTimeStr: '09:00', // Jam 09:00 pagi
  finesPurpose: 'Denda bertujuan untuk menertibkan peminjaman dan dikumpulkan kembali untuk pembelian buku cerita baru & perawatan buku perpustakaan.',
  qrisMerchantName: 'PERPUSTAKAAN KB-TK BHAKTI TUNAS HARAPAN',
  qrisNmid: 'ID1020039482910',
  qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126610016ID.CO.QRIS.WWW01189360099900000000000215ID10200394829100303UMI51440014ID.GOV.PERPUS5204581253033605802ID5944PERPUSTAKAAN%20KB-TK%20BHAKTI%20TUNAS%20HARAPAN6008MAGELANG6105561236304',
  enableFinanceModule: false, // Default OFF sesuai instruksi: semua yang berkaitan dengan denda disembunyikan
  bankName: 'BCA (Bank Central Asia)',
  bankAccountNumber: '012-345-6789',
  bankAccountHolder: 'Perpustakaan KB-TK Bhakti Tunas Harapan',
  maxReservationsTotal: 2, // Maksimal kuota reservasi buku saat tidak sedang meminjam
  maxReservationsWhenBorrowing: 1, // Maksimal kuota reservasi buku jika sedang ada pinjaman aktif
};

// Keyboard Shortcuts Configuration for Librarian Workspace
// Menggunakan Alt + [1-8] & F1 agar 100% AMAN dari bentrok Google Chrome (bebas dari tab tertutup Ctrl+W)
export const DEFAULT_KEYBOARD_SHORTCUTS: import('@/types').KeyboardShortcutConfig = {
  newLoan: 'Alt+1',       // Alt + 1: Sirkulasi - Peminjaman Baru
  returnBook: 'Alt+2',    // Alt + 2: Sirkulasi - Pengembalian Kilat (Aman dari close tab)
  renewLoan: 'Alt+3',     // Alt + 3: Sirkulasi - Perpanjangan Pinjaman
  overdueTab: 'Alt+4',    // Alt + 4: Sirkulasi - Tagihan Terlambat
  booksTab: 'Alt+5',      // Alt + 5: Meja Koleksi Buku & Eksemplar
  membersTab: 'Alt+6',    // Alt + 6: Data Anggota Siswa & Guru
  opacTab: 'Alt+7',       // Alt + 7: Katalog Visual Anak (OPAC)
  settingsModal: 'Alt+8', // Alt + 8: Pengaturan Sistem (Memerlukan Admin)
  helpModal: 'F1',        // F1: Buka Bantuan Panduan Shortcut
};

// Preset Standar SBTH 4-Digit (Fisik) Sesuai Permintaan Resmi Sekolah SBTH:
// Prefix kosong "", 4 digit nomor seri (0101, 0143, 0177), suffix kosong "", dan slip bertanggal DD/MM/YYYY.
export const DEFAULT_SLIMS_PATTERN: import('@/types').SlimsPatternConfig = {
  patternMode: 'SBTH_4DIGIT',
  prefix: '',
  serialLength: 4,
  suffix: '',
  nextNumber: 177,
};

// Helper standar klasifikasi DDC & Nomor Panggil SLiMS (3 Baris: DDC + 3 Huruf Pengarang + 1 Huruf Judul)
export function generateSlimsCallNumber(title: string, author: string, categoryId?: string): string {
  // 1. Tentukan nomor DDC berdasarkan kategori buku TK
  let ddc = '398.2'; // Fabel & Dongeng
  if (categoryId === 'cat-alam') ddc = '500';
  else if (categoryId === 'cat-aktivitas') ddc = '372.2';
  else if (categoryId === 'cat-karakter') ddc = '170';
  else if (categoryId === 'cat-ensiklopedia') ddc = '030';
  else if (categoryId === 'cat-bahasa') ddc = '495.1';

  // 2. Ambil 3 huruf kapital nama pengarang
  const cleanAuthor = author.replace(/^(Tim|Kak|Dr\.|Dra\.|Mr\.|Ms\.|Miss)\s+/i, '').trim();
  const authorWords = cleanAuthor.split(/\s+/).filter(Boolean);
  const mainAuthor = authorWords[authorWords.length - 1] || authorWords[0] || 'SBTH';
  const authorCode = mainAuthor.substring(0, 3).toUpperCase();

  // 3. Ambil 1 huruf kecil judul pertama (abaikan kata sambung umum)
  const cleanTitle = title.replace(/^(Seri|Kumpulan|Buku|Cerita|Si|Sang|The|A|An)\s+/i, '').trim();
  const titleCode = (cleanTitle[0] || 'b').toLowerCase();

  return `${ddc} ${authorCode} ${titleCode}`;
}

// ========================================================
// STANDAR PENAMAAN FISIK BUKU RAK PERPUSTAKAAN SBTH
// ========================================================
// Format Punggung Buku Fisik SBTH (4 Baris Vertikal):
// Baris 1: Kode Rak / Kategori (Default: "SR", bisa kustom rak: "AG", "SN", dll.)
// Baris 2: Nomor Klasifikasi DDC (e.g. "813", "220", "398.2")
// Baris 3: 3 Huruf Kapital Pengarang (Cutter, e.g. "KID", "JUL")
// Baris 4: 1 Huruf Kecil Pertama Judul Buku (e.g. "m", "t")

export interface SbthSpineParts {
  shelfCode: string;   // Baris 1: e.g. "SR"
  ddc: string;         // Baris 2: e.g. "813" / "220" / "398.2" / "500"
  authorCode: string;  // Baris 3: 3 Huruf Kapital Pengarang (e.g. "BAM", "JUL")
  titleCode: string;   // Baris 4: 1 Huruf Depan Judul (e.g. "k", "t")
}

// 1. Baris 1: Kode Rak SBTH (Bawaan "SR", atau kode rak kategori seperti "SN", "AG", "CR")
export function deriveShelfCode(categoryId?: string, customShelfCode?: string): string {
  if (customShelfCode && customShelfCode.trim()) {
    return customShelfCode.trim().toUpperCase();
  }
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat?.shelfCode ? cat.shelfCode.toUpperCase() : 'SR';
}

// 2. Baris 2: Nomor Klasifikasi DDC berdasarkan Kategori Buku
export function deriveCategoryDdc(categoryId?: string, title?: string, customClassification?: string): string {
  if (customClassification && customClassification.trim()) {
    return customClassification.trim();
  }
  const cleanTitle = (title || '').toLowerCase();

  // DDC 000 - Karya Umum / Ensiklopedia
  if (categoryId === 'ddc-000' || categoryId === 'cat-ensiklopedia') {
    if (cleanTitle.includes('ensiklopedia') || cleanTitle.includes('encyclopedia') || cleanTitle.includes('1.111') || cleanTitle.includes('tanya')) return '030';
    if (cleanTitle.includes('komputer') || cleanTitle.includes('digital')) return '004';
    return '000';
  }

  // DDC 100 - Filsafat & Budi Pekerti
  if (categoryId === 'ddc-100' || categoryId === 'cat-karakter') {
    if (cleanTitle.includes('doa') || cleanTitle.includes('islam') || cleanTitle.includes('sholat') || cleanTitle.includes('tuhan') || cleanTitle.includes('nabi')) {
      return '297';
    }
    if (cleanTitle.includes('marah') || cleanTitle.includes('takut') || cleanTitle.includes('sedih') || cleanTitle.includes('emosi')) return '150';
    return '170'; // Etika & Budi Pekerti
  }

  // DDC 200 - Agama & Doa
  if (categoryId === 'ddc-200') {
    if (cleanTitle.includes('islam') || cleanTitle.includes('sholat') || cleanTitle.includes('quran') || cleanTitle.includes('nabi') || cleanTitle.includes('rukun islam')) {
      return '297';
    }
    if (cleanTitle.includes('kristen') || cleanTitle.includes('yesus') || cleanTitle.includes('alkitab')) return '230';
    return '200';
  }

  // DDC 300 - Ilmu Sosial & Cerita Rakyat / PAUD
  if (categoryId === 'ddc-300') {
    if (cleanTitle.includes('fabel') || cleanTitle.includes('dongeng') || cleanTitle.includes('kancil') || cleanTitle.includes('rakyat') || cleanTitle.includes('timun')) return '398.2';
    if (cleanTitle.includes('tk') || cleanTitle.includes('paud') || cleanTitle.includes('sekolah') || cleanTitle.includes('baca') || cleanTitle.includes('hitung')) return '372.2';
    return '300';
  }

  // DDC 400 - Bahasa
  if (categoryId === 'ddc-400' || categoryId === 'cat-bahasa') {
    if (cleanTitle.includes('english') || cleanTitle.includes('inggris')) return '420';
    if (cleanTitle.includes('mandarin') || cleanTitle.includes('chinese') || cleanTitle.includes('pinyin') || cleanTitle.includes('中文')) return '495.1';
    if (cleanTitle.includes('kamus') || cleanTitle.includes('indonesia')) return '499.221';
    return '400';
  }

  // DDC 500 - Sains Murni & Alam
  if (categoryId === 'ddc-500' || categoryId === 'cat-alam') {
    if (cleanTitle.includes('hewan') || cleanTitle.includes('binatang') || cleanTitle.includes('satwa') || cleanTitle.includes('fauna') || cleanTitle.includes('panda')) return '590';
    if (cleanTitle.includes('dinosaurus') || cleanTitle.includes('dino') || cleanTitle.includes('fosil')) return '560';
    if (cleanTitle.includes('tumbuhan') || cleanTitle.includes('tanaman') || cleanTitle.includes('pohon') || cleanTitle.includes('bunga')) return '580';
    if (cleanTitle.includes('bumi') || cleanTitle.includes('cuaca') || cleanTitle.includes('hujan') || cleanTitle.includes('laut')) return '550';
    if (cleanTitle.includes('antariksa') || cleanTitle.includes('planet') || cleanTitle.includes('tata surya') || cleanTitle.includes('bintang')) return '520';
    if (cleanTitle.includes('hitung') || cleanTitle.includes('matematika') || cleanTitle.includes('angka')) return '510';
    return '500';
  }

  // DDC 600 - Teknologi & Kesehatan
  if (categoryId === 'ddc-600') {
    if (cleanTitle.includes('dokter') || cleanTitle.includes('kesehatan') || cleanTitle.includes('tubuh') || cleanTitle.includes('gigi')) return '610';
    if (cleanTitle.includes('kendaraan') || cleanTitle.includes('mobil') || cleanTitle.includes('pesawat') || cleanTitle.includes('kereta')) return '620';
    if (cleanTitle.includes('memasak') || cleanTitle.includes('kue') || cleanTitle.includes('makanan')) return '640';
    return '600';
  }

  // DDC 700 - Kesenian & Mewarnai
  if (categoryId === 'ddc-700' || categoryId === 'cat-aktivitas') {
    if (cleanTitle.includes('mewarnai') || cleanTitle.includes('menggambar') || cleanTitle.includes('lukis')) return '740';
    if (cleanTitle.includes('lagu') || cleanTitle.includes('musik') || cleanTitle.includes('nyanyi')) return '780';
    if (cleanTitle.includes('senam') || cleanTitle.includes('olahraga') || cleanTitle.includes('permainan') || cleanTitle.includes('maze')) return '790';
    return '700';
  }

  // DDC 800 - Kesusastraan & Fiksi Anak
  if (categoryId === 'ddc-800' || categoryId === 'cat-dongeng') {
    if (cleanTitle.includes('fabel') || cleanTitle.includes('kancil') || cleanTitle.includes('rakyat')) return '398.2';
    return '813'; // Fiksi / Cerpen Anak Indonesia
  }

  // DDC 900 - Sejarah & Geografi
  if (categoryId === 'ddc-900') {
    if (cleanTitle.includes('peta') || cleanTitle.includes('atlas') || cleanTitle.includes('keliling dunia') || cleanTitle.includes('geografi')) return '910';
    if (cleanTitle.includes('pahlawan') || cleanTitle.includes('tokoh') || cleanTitle.includes('biografi') || cleanTitle.includes('kartini')) return '920';
    if (cleanTitle.includes('indonesia') && cleanTitle.includes('kemerdekaan')) return '959.8';
    return '900';
  }

  return '813'; // Default Fiksi/Cerpen Anak SBTH
}

// 3. Baris 3: 3 Huruf Kapital Pengarang (Cutter Number Standar Perpustakaan)
export function deriveAuthorCode(author: string, customAuthorCode?: string): string {
  if (customAuthorCode && customAuthorCode.trim()) {
    return customAuthorCode.trim().toUpperCase().substring(0, 3).padEnd(3, 'X');
  }
  if (!author || !author.trim()) return 'SBT';

  // Hapus gelar, sebutan kehormatan, dan kata pengantar umum
  const clean = author
    .replace(/^(Tim|Kak|dr\.|Dr\.|dra\.|Dra\.|Ir\.|ir\.|Prof\.|prof\.|Bunda|bunda|Ayah|ayah|Ustadz|ustadz|Ustadzah|ustadzah|Mr\.|mr\.|Mrs\.|mrs\.|Ms\.|ms\.|Miss|miss)\s+/i, '')
    .trim();

  // Bersihkan karakter non-huruf di awal kata
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'SBT';

  // Standar perpustakaan: ambil kata utama atau nama belakang jika ada
  let chosenWord = words[words.length - 1]; // e.g. Siswati -> SIS, Bambang -> BAM
  // Jika kata terakhir berupa singkatan atau "& Tim", ambil kata pertama
  if (chosenWord.length < 2 || chosenWord.toLowerCase() === 'tim' || chosenWord === '&') {
    chosenWord = words[0];
  }

  const alphaOnly = chosenWord.replace(/[^a-zA-Z]/g, '');
  if (alphaOnly.length >= 3) {
    return alphaOnly.substring(0, 3).toUpperCase();
  }
  return alphaOnly.toUpperCase().padEnd(3, 'X');
}

// 4. Baris 4: 1 Huruf Depan Judul Buku (Mengabaikan Stopwords Awal)
export function deriveTitleCode(title: string, customTitleCode?: string): string {
  if (customTitleCode && customTitleCode.trim()) {
    return customTitleCode.trim().substring(0, 1).toLowerCase();
  }
  if (!title || !title.trim()) return 't';

  // Hapus awalan stopwords umum judul buku anak
  const clean = title
    .replace(/^(Seri|Kumpulan|Buku|Cerita|Kisah|Mengenal|Belajar|Si|Sang|The|A|An)\s+/i, '')
    .trim();

  const alpha = clean.replace(/^[^a-zA-Z0-9]+/, '');
  const char = alpha.charAt(0);
  return char ? char.toLowerCase() : 't';
}

export function getSbthSpineCode(
  title: string,
  author: string,
  categoryId?: string,
  customShelfCode?: string,
  customClassification?: string,
  customAuthorCode?: string,
  customTitleCode?: string
): SbthSpineParts {
  const shelfCode = deriveShelfCode(categoryId, customShelfCode);
  const ddc = deriveCategoryDdc(categoryId, title, customClassification);
  const authorCode = deriveAuthorCode(author, customAuthorCode);
  const titleCode = deriveTitleCode(title, customTitleCode);

  return {
    shelfCode,
    ddc,
    authorCode,
    titleCode,
  };
}

// Helper format tanggal & waktu standar Indonesia DD/MM/YYYY dan HH:mm
export function formatDateDDMMYYYY(isoOrDateStr?: string): string {
  if (!isoOrDateStr) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }
  try {
    const dObj = new Date(isoOrDateStr);
    if (!isNaN(dObj.getTime())) {
      const d = String(dObj.getDate()).padStart(2, '0');
      const m = String(dObj.getMonth() + 1).padStart(2, '0');
      const y = dObj.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const clean = isoOrDateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return isoOrDateStr;
  } catch {
    return isoOrDateStr;
  }
}

export function formatDateTimeIndo(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return '-';
  try {
    const dObj = new Date(isoOrDateStr);
    if (isNaN(dObj.getTime())) {
      return formatDateDDMMYYYY(isoOrDateStr);
    }
    const d = String(dObj.getDate()).padStart(2, '0');
    const m = String(dObj.getMonth() + 1).padStart(2, '0');
    const y = dObj.getFullYear();
    const hh = String(dObj.getHours()).padStart(2, '0');
    const mm = String(dObj.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y}, ${hh}:${mm} WIB`;
  } catch {
    return isoOrDateStr;
  }
}

// Helper Posisi Rak & Baris (Row/Sap)
export interface ParsedShelfLocation {
  shelfName: string;
  rowName: string;
  hasRow: boolean;
  fullLocation: string;
}

export const DEFAULT_SHELF_ROWS = [
  'Baris 1',
  'Baris 2',
  'Baris 3',
  'Baris 4',
  'Baris 5',
  'Baris 6',
];

export function parseShelfLocation(location?: string): ParsedShelfLocation {
  if (!location || !location.trim()) {
    return { shelfName: '', rowName: '', hasRow: false, fullLocation: '' };
  }
  const trimmed = location.trim();
  const regex = /^(.*?)\s*-\s*(Baris\s+\d+|Sap\s+\d+|Tingkat\s+\d+|Row\s+\d+.*)$/i;
  const match = trimmed.match(regex);
  if (match) {
    return {
      shelfName: match[1].trim(),
      rowName: match[2].trim(),
      hasRow: true,
      fullLocation: trimmed,
    };
  }
  if (trimmed.includes(' - ')) {
    const parts = trimmed.split(' - ');
    const lastPart = parts[parts.length - 1].trim();
    if (/baris|sap|tingkat|row/i.test(lastPart)) {
      return {
        shelfName: parts.slice(0, -1).join(' - ').trim(),
        rowName: lastPart,
        hasRow: true,
        fullLocation: trimmed,
      };
    }
  }
  return {
    shelfName: trimmed,
    rowName: '',
    hasRow: false,
    fullLocation: trimmed,
  };
}

export function combineShelfLocation(shelfName: string, rowName: string, includeRow: boolean): string {
  const cleanShelf = (shelfName || '').trim();
  const cleanRow = (rowName || '').trim();
  if (!cleanShelf) return '';
  if (!includeRow || !cleanRow || cleanRow === '-' || cleanRow === 'Tanpa Baris') {
    return cleanShelf;
  }
  return `${cleanShelf} - ${cleanRow}`;
}

// Format Bagian Dalam Buku Fisik SBTH (Cap/Slip Buku):
// No. Daftar: 4 digit angka (e.g. "0101", "0143", "0176")
// Tanggal: DD/MM/YYYY (e.g. "22/10/2026")
export function getSbthInsideSlipData(barcode: string, copyNum: number, acquisitionDate?: string) {
  const digits = barcode.replace(/\D/g, '');
  let accessionNumber = '0001';
  if (digits.length >= 4) {
    accessionNumber = digits.slice(-4);
  } else if (digits.length > 0) {
    accessionNumber = digits.padStart(4, '0');
  } else {
    accessionNumber = String(copyNum).padStart(4, '0');
  }

  const dateStr = formatDateDDMMYYYY(acquisitionDate);

  return {
    accessionNumber,
    dateStr,
  };
}

// Berita & Pengumuman Perpustakaan Resmi SBTH (CMS Ringkas)
export const DEFAULT_LIBRARY_NEWS: import('@/types').LibraryNewsArticle[] = [
  {
    id: 'news-1',
    title: '🎉 Selamat Datang di Perpustakaan Cerdas KB-TK SBTH!',
    summary: 'Sistem sirkulasi mandiri ramah anak, scan barcode fisik, dan katalog buku impian telah aktif.',
    content: 'Perpustakaan KB-TK Bhakti Tunas Harapan kini menggunakan sistem sirkulasi modern terintegrasi. Siswa dapat melihat buku cerita favorit dan menambahkan ke Buku Impian.',
    category: 'ANNOUNCEMENT',
    badgeText: 'PENGUMUMAN RESMI',
    publishedDate: '2026-10-15',
    isPinned: true,
    isActive: true,
    author: 'Pustakawan KB-TK SBTH',
  },
  {
    id: 'news-2',
    title: '📚 Jadwal Layanan Sirkulasi & Peminjaman Buku Cerita',
    summary: 'Peminjaman buku cerita setiap hari Senin - Jumat pukul 07.30 - 13.00 WIB.',
    content: 'Ananda diperkenankan meminjam hingga 2 buku cerita selama 7 hari. Bagi orang tua yang ingin memperpanjang masa pinjam dapat menghubungi Pustakawan via WhatsApp atau tombol Perpanjangan.',
    category: 'NEW_BOOKS',
    badgeText: 'INFO SIRKULASI',
    publishedDate: '2026-10-12',
    isPinned: false,
    isActive: true,
    author: 'Tim Literasi Sekolah',
  },
  {
    id: 'news-3',
    title: '🔍 Pelaksanaan Stock Opname & Penataan Ulang Rak Buku',
    summary: 'Kegiatan cacah ulang fisik koleksi buku untuk memastikan ketersediaan buku di rak.',
    content: 'Seluruh koleksi buku cerita anak ditata rapi berdasarkan kategori warna stiker rak (Kuning, Hijau, Biru, Merah, Pink, Ungu).',
    category: 'STOCK_OPNAME',
    badgeText: 'STOCK OPNAME',
    publishedDate: '2026-10-10',
    isPinned: false,
    isActive: true,
    author: 'Penanggung Jawab Perpustakaan',
  },
];

export const DEFAULT_TELEGRAM_TEMPLATES: import('@/types').TelegramCommandTemplate[] = [
  {
    command: '/rekap_hari_ini',
    title: 'Rekap Statistik Harian',
    description: 'Ringkasan sirkulasi peminjaman, pengembalian, dan kas hari ini',
    template: `📊 *REKAP HARIAN PERPUSTAKAAN {nama_sekolah}*
📅 Tanggal: {tanggal}
----------------------------------------

📚 *AKTIVITAS SIRKULASI HARI INI:*
▫️ Total Peminjaman Baru: {pinjam_hari_ini} transaksi
▫️ Total Buku Dikembalikan: {kembali_hari_ini} transaksi
▫️ Masih Dipinjam Aktif: {total_aktif} buku

💰 *KAS & DANA LITERASI HARI INI:*
▫️ Kas Masuk: Rp {kas_masuk_hari_ini}
▫️ Tunggakan: Rp {tunggakan_hari_ini}
(Kas denda 100% untuk pembelian buku baru & perawatan)

Semangat mencerdaskan anak bangsa! ✨`,
  },
  {
    command: '/rekap_mingguan',
    title: 'Laporan Mingguan Lengkap',
    description: 'Laporan komprehensif buku masuk, denda, dan inventaris mingguan',
    template: `📊 *LAPORAN PERPUSTAKAAN {nama_sekolah}*
Periode: {periode}
________________________________________

📥 *BUKU BARU MASUK:* +{buku_baru_count} Eksemplar
├── 🛒 Pembelian Sekolah: {beli_count} Eks (Rp {beli_nominal})
└── 🎁 Sumbangan Ortu/Hibah: {sumbang_count} Eks

🔄 *SIRKULASI PEMINJAMAN*
├── 📖 Total Transaksi: {total_transaksi} Peminjaman
├── ✅ Sudah Dikembalikan: {sudah_kembali} Transaksi
├── ⏳ Masih Dipinjam (Aktif): {masih_pinjam} Transaksi
└── ⚠️ Terlambat Kembali (>7 Hari): {terlambat_count} Siswa

🛠️ *KONDISI INVENTARIS & KOLEKSI*
├── 📚 Total Koleksi Siap Pinjam: {total_siap} Eks
├── 📦 Total Nilai Inventaris: Rp {nilai_inventaris}
└── 🩹 Buku Rusak/Hilang: {rusak_hilang} Eks

💰 *KAS DENDA & PENGGANTIAN*
├── 💵 Denda Keterlambatan Masuk: Rp {denda_masuk}
├── 🔄 Ganti Rugi Rusak/Hilang: Rp {ganti_masuk}
├── 🎁 Sumbangan Kas Tunai: Rp {sumbangan_kas}
└── ⏳ Tunggakan Belum Lunas: Rp {tunggakan}
(Kas denda digunakan untuk pengadaan buku cerita baru)

📎 Terlampir: Backup Data Master Excel (.xlsx)`,
  },
  {
    command: '/rekap_bulanan',
    title: 'Laporan Bulanan Resmi',
    description: 'Laporan bulanan untuk Kepala Sekolah dan Yayasan',
    template: `📋 *LAPORAN BULANAN PERPUSTAKAAN {nama_sekolah}*
Bulan: {bulan}
________________________________________

🏛️ *RINGKASAN ASET & INVENTARIS:*
▫️ Total Judul Buku: {total_judul} Judul
▫️ Total Fisik Koleksi: {total_eksemplar} Eksemplar
▫️ Estimasi Nilai Inventaris: Rp {nilai_inventaris}

📈 *TREN PEMINJAMAN SISWA:*
▫️ Total Sirkulasi Bulan Ini: {sirkulasi_bulanan} Kali
▫️ Kategori Terfavorit: {kategori_favorit}
▫️ Kelas Paling Aktif Membaca: {kelas_teraktif}

💵 *REKAP KEUANGAN KAS PERPUSTAKAAN:*
▫️ Saldo Kas Terkumpul: Rp {total_kas_bulanan}
▫️ Rencana Alokasi: Pembelian koleksi cerita anak baru

Hormat kami,
Tim Pustakawan {nama_sekolah}`,
  },
  {
    command: '/cek_terlambat',
    title: 'Daftar Siswa Terlambat + Kontak WA',
    description: 'Daftar siswa yang melewati batas pinjam beserta nomor WA orang tua',
    template: `⚠️ *DAFTAR KETERLAMBATAN BUKU PERPUSTAKAAN*
{nama_sekolah} - Per {tanggal}
________________________________________

{daftar_siswa_terlambat}

💡 *Tindakan Pustakawan:*
Kirimkan pesan pengingat ke WA orang tua murid agar buku dapat dibawa kembali ke sekolah besok pagi. Terima kasih! 🙏`,
  },
];

// Konfigurasi Standar Pintasan Keyboard Mode Pustakawan
export const DEFAULT_SHORTCUT_ITEMS: import('@/types').KeyboardShortcutItem[] = [
  { id: 'sc-1', label: 'Peminjaman Baru', key: 'Q', ctrlKey: true, description: 'Buka Sirkulasi mode Peminjaman Baru', action: 'NAV_BORROW' },
  { id: 'sc-2', label: 'Pengembalian Kilat', key: 'W', ctrlKey: true, description: 'Buka Sirkulasi mode Pengembalian Kilat 4-Langkah', action: 'NAV_RETURN' },
  { id: 'sc-3', label: 'Koleksi & Eksemplar Buku', key: 'E', ctrlKey: true, description: 'Buka tab Koleksi & Eksemplar Buku', action: 'NAV_BOOKS' },
  { id: 'sc-4', label: 'Perpanjangan Pinjaman', key: 'R', ctrlKey: true, description: 'Buka Sirkulasi mode Perpanjangan Buku', action: 'NAV_EXTEND' },
  { id: 'sc-5', label: 'Kelola Anggota Siswa', key: 'M', ctrlKey: true, description: 'Buka tab Anggota & Data Siswa', action: 'NAV_MEMBERS' },
  { id: 'sc-6', label: 'Katalog Visual Anak (OPAC)', key: 'K', ctrlKey: true, description: 'Buka Katalog Visual Anak (OPAC)', action: 'NAV_OPAC' },
  { id: 'sc-7', label: 'Pengaturan Perpustakaan', key: 'P', ctrlKey: true, description: 'Buka Pengaturan Sistem Perpustakaan', action: 'OPEN_SETTINGS' },
  { id: 'sc-8', label: 'Panduan Pintasan Keyboard', key: 'F1', ctrlKey: false, description: 'Tampilkan panduan tombol pintasan cepat', action: 'HELP_SHORTCUTS' },
];

// Standar Opsi Format Fisik Buku Anak (TK / PAUD / SD)
export interface PhysicalFormatOption {
  value: string;
  label: string;
  icon: string;
  description?: string;
}

export const PHYSICAL_FORMAT_OPTIONS: PhysicalFormatOption[] = [
  { value: 'Cerita Bergambar', label: 'Cerita Bergambar (Picture Book)', icon: '📘', description: 'Buku cerita penuh ilustrasi warna untuk anak' },
  { value: 'Boardbook', label: 'Boardbook (Karton Tebal Balita)', icon: '📗', description: 'Halaman karton tebal, anti sobek, cocok untuk Toddler & Playgroup' },
  { value: 'Hardcover', label: 'Hardcover (Jilid Tebal Kokoh)', icon: '📕', description: 'Sampul keras berkualitas tinggi, awet untuk perpustakaan' },
  { value: 'Softcover / Paperback', label: 'Softcover / Paperback', icon: '📄', description: 'Sampul tipis/standar, fleksibel dan ringan dibaca' },
  { value: 'Pop-Up / 3D', label: 'Pop-Up / 3D Interaktif', icon: '✨', description: 'Gambar timbul saat halaman dibuka' },
  { value: 'Flip-Flap', label: 'Flip-Flap (Buka-Tutup Jendela)', icon: '📖', description: 'Halaman dengan jendela rahasia yang bisa diangkat/dibuka anak' },
  { value: 'Buku Bantal / Kain', label: 'Buku Bantal / Kain (Cloth Book)', icon: '🧸', description: 'Buku berbahan kain lembut, aman untuk bayi dan toddler' },
  { value: 'Buku Bersuara (Sound Book)', label: 'Buku Bersuara (Sound/Audio Book)', icon: '🔊', description: 'Dilengkapi tombol suara musik, hewan, atau cerita' },
  { value: 'Buku Tekstur / Raba', label: 'Buku Tekstur / Raba (Touch & Feel)', icon: '🖐️', description: 'Memiliki tekstur berbulu, kasar, atau halus untuk sensori' },
  { value: 'Komik Edukasi Anak', label: 'Komik Edukasi Anak', icon: '🎨', description: 'Cerita bergambar format panel komik ringan mendidik' },
  { value: 'Ensiklopedia Bergambar', label: 'Ensiklopedia Bergambar Anak', icon: '🌍', description: 'Pengetahuan sains, hewan, dan dunia dengan foto menarik' },
  { value: 'Buku Aktivitas & Mewarnai', label: 'Buku Aktivitas & Mewarnai', icon: '🖍️', description: 'Buku latihan tracing garis, mewarnai, dan maze' },
  { value: 'Modul Belajar / LKS', label: 'Modul Belajar / Lembar Kerja (LKS)', icon: '📝', description: 'Materi tematik mingguan siswa KB-TK' },
  { value: 'Flashcard Edukatif', label: 'Flashcard / Kartu Edukatif', icon: '🎴', description: 'Kartu alfabet, angka, hijaiyah, atau kosa kata' },
  { value: 'Kamus Visual Bergambar', label: 'Kamus Visual Bergambar', icon: '📚', description: 'Kamus tematik 3 bahasa (ID - EN - Mandarin) dengan gambar' },
  { value: 'Majalah / Buletin Anak', label: 'Majalah / Buletin Anak', icon: '📰', description: 'Edisi berkala bacaan anak dan sekolah' },
  { value: 'E-Book / Interaktif Digital', label: 'E-Book / Interaktif Digital', icon: '💻', description: 'Materi digital audio-visual perpustakaan' },
];
