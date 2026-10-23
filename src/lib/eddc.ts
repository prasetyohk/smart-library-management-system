import * as XLSX from 'xlsx';
import { Category } from '@/types';

// ============================================================================
// 10 KELAS UTAMA DDC (DEWEY DECIMAL CLASSIFICATION) RESMI PERPUSTAKAAN SBTH
// Setiap kelas DDC memiliki warna cerah kontras untuk stiker punggung buku
// ============================================================================
export const OFFICIAL_DDC_CATEGORIES: Category[] = [
  {
    id: 'ddc-000',
    ddcCode: '000',
    name: '000 - Karya Umum, Komputer & Ensiklopedia',
    shortName: '000 KARYA UMUM',
    shelfCode: 'KU',
    colorHex: '#6366F1', // Indigo / Biru Ungu
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    badgeBorder: 'border-indigo-300 dark:border-indigo-700',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    iconName: 'Sparkles',
    shelfLocation: 'Rak 000 (Karya Umum & Ensiklopedia)',
    description: 'Kamus bergambar, ensiklopedia cilik, almanak pengetahuan, komputer & referensi anak.',
  },
  {
    id: 'ddc-100',
    ddcCode: '100',
    name: '100 - Filsafat, Karakter & Budi Pekerti',
    shortName: '100 KARAKTER',
    shelfCode: 'KP',
    colorHex: '#F59E0B', // Amber / Emas
    badgeBg: 'bg-amber-100 dark:bg-amber-950/50',
    badgeBorder: 'border-amber-300 dark:border-amber-700',
    badgeText: 'text-amber-800 dark:text-amber-300',
    iconName: 'Heart',
    shelfLocation: 'Rak 100 (Budi Pekerti & Emosi)',
    description: 'Pendidikan karakter, pengenalan emosi (senang/sedih/marah), kejujuran, sopan santun & kepribadian.',
  },
  {
    id: 'ddc-200',
    ddcCode: '200',
    name: '200 - Agama, Doa & Nilai Religi',
    shortName: '200 AGAMA',
    shelfCode: 'AG',
    colorHex: '#10B981', // Emerald Green / Hijau Zamrud
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    iconName: 'Star',
    shelfLocation: 'Rak 200 (Agama & Budi Luhur)',
    description: 'Doa sehari-hari, kisah teladan nabi, rukun ibadah, budi luhur dan kasih sayang ketuhanan.',
  },
  {
    id: 'ddc-300',
    ddcCode: '300',
    name: '300 - Ilmu Sosial, Kebiasaan & Cerita Rakyat',
    shortName: '300 SOSIAL',
    shelfCode: 'SO',
    colorHex: '#0EA5E9', // Sky Blue / Biru Cerah
    badgeBg: 'bg-sky-100 dark:bg-sky-950/50',
    badgeBorder: 'border-sky-300 dark:border-sky-700',
    badgeText: 'text-sky-800 dark:text-sky-300',
    iconName: 'BookOpen',
    shelfLocation: 'Rak 300 (Ilmu Sosial & Fabel Nusantara)',
    description: 'Keluarga, sekolah, pertemanan, profesi damkar/polisi/guru, adat nusantara & dongeng rakyat (398.2).',
  },
  {
    id: 'ddc-400',
    ddcCode: '400',
    name: '400 - Bahasa, Fonik, Mandarin & Inggris',
    shortName: '400 BAHASA',
    shelfCode: 'BH',
    colorHex: '#EC4899', // Pink Rose
    badgeBg: 'bg-pink-100 dark:bg-pink-950/50',
    badgeBorder: 'border-pink-300 dark:border-pink-700',
    badgeText: 'text-pink-800 dark:text-pink-300',
    iconName: 'BookOpen',
    shelfLocation: 'Rak 400 (Trilingual SBTH & Fonik)',
    description: 'Mengenal huruf, membaca fonik, kosa kata bergambar, buku cerita Mandarin (中文) & English story.',
  },
  {
    id: 'ddc-500',
    ddcCode: '500',
    name: '500 - Sains Murni, Alam, Satwa & Berhitung',
    shortName: '500 SAINS',
    shelfCode: 'SN',
    colorHex: '#14B8A6', // Teal / Hijau Laut
    badgeBg: 'bg-teal-100 dark:bg-teal-950/50',
    badgeBorder: 'border-teal-300 dark:border-teal-700',
    badgeText: 'text-teal-800 dark:text-teal-300',
    iconName: 'Leaf',
    shelfLocation: 'Rak 500 (Sains Alam & Satwa)',
    description: 'Dunia binatang, tanaman, dinosaurus, tata surya/bumi, keajaiban sains & matematika berhitung cilik.',
  },
  {
    id: 'ddc-600',
    ddcCode: '600',
    name: '600 - Teknologi, Kesehatan Tubuh & Rekayasa',
    shortName: '600 TEKNOLOGI',
    shelfCode: 'TK',
    colorHex: '#F97316', // Orange / Oranye Terang
    badgeBg: 'bg-orange-100 dark:bg-orange-950/50',
    badgeBorder: 'border-orange-300 dark:border-orange-700',
    badgeText: 'text-orange-800 dark:text-orange-300',
    iconName: 'Sparkles',
    shelfLocation: 'Rak 600 (Kesehatan & Teknologi)',
    description: 'Tubuh manusia, kesehatan gigi, dokter cilik, kendaraan mobil/pesawat/kereta & memasak sehat.',
  },
  {
    id: 'ddc-700',
    ddcCode: '700',
    name: '700 - Kesenian, Mewarnai, Musik & Olahraga',
    shortName: '700 KESENIAN',
    shelfCode: 'KS',
    colorHex: '#8B5CF6', // Purple / Ungu
    badgeBg: 'bg-purple-100 dark:bg-purple-950/50',
    badgeBorder: 'border-purple-300 dark:border-purple-700',
    badgeText: 'text-purple-800 dark:text-purple-300',
    iconName: 'Sparkles',
    shelfLocation: 'Rak 700 (Kesenian & Kreativitas)',
    description: 'Buku mewarnai, menggambar, melipat kertas (origami), lagu anak, musik, olahraga & permainan kreatif.',
  },
  {
    id: 'ddc-800',
    ddcCode: '800',
    name: '800 - Kesusastraan, Cerita Bergambar & Fabel',
    shortName: '800 SASTRA',
    shelfCode: 'SR',
    colorHex: '#EF4444', // Red / Merah
    badgeBg: 'bg-rose-100 dark:bg-rose-950/50',
    badgeBorder: 'border-rose-300 dark:border-rose-700',
    badgeText: 'text-rose-800 dark:text-rose-300',
    iconName: 'Star',
    shelfLocation: 'Rak 800 (Fiksi & Cerita Bergambar)',
    description: 'Dongeng klasik anak sedunia, fabel binatang, cerita pengantar tidur, picture book & kisah imajinatif.',
  },
  {
    id: 'ddc-900',
    ddcCode: '900',
    name: '900 - Sejarah, Geografi, Pahlawan & Peta',
    shortName: '900 SEJARAH',
    shelfCode: 'SJ',
    colorHex: '#84CC16', // Lime Green / Hijau Muda
    badgeBg: 'bg-lime-100 dark:bg-lime-950/50',
    badgeBorder: 'border-lime-300 dark:border-lime-700',
    badgeText: 'text-lime-800 dark:text-lime-300',
    iconName: 'BookOpen',
    shelfLocation: 'Rak 900 (Sejarah & Keliling Dunia)',
    description: 'Kisah pahlawan nasional Indonesia, keliling dunia, peta anak, atlas bergambar & perjalanan bersejarah.',
  },
];

// Palet warna kurasi siap pilih (16 warna cerah ramah perpustakaan sekolah)
export const PRESET_LIBRARY_COLORS = [
  { name: 'Merah (Sastra/Fiksi)', hex: '#EF4444' },
  { name: 'Crimson Pekat', hex: '#DC2626' },
  { name: 'Oranye Terang (Teknologi)', hex: '#F97316' },
  { name: 'Amber / Emas (Karakter)', hex: '#F59E0B' },
  { name: 'Kuning Hangat', hex: '#EAB308' },
  { name: 'Lime Cerah (Sejarah)', hex: '#84CC16' },
  { name: 'Hijau Daun', hex: '#22C55E' },
  { name: 'Emerald (Agama)', hex: '#10B981' },
  { name: 'Teal (Sains & Alam)', hex: '#14B8A6' },
  { name: 'Cyan Segar', hex: '#06B6D4' },
  { name: 'Sky Blue (Sosial/Fabel)', hex: '#0EA5E9' },
  { name: 'Biru Klasik', hex: '#3B82F6' },
  { name: 'Indigo (Karya Umum)', hex: '#6366F1' },
  { name: 'Ungu Violet (Kesenian)', hex: '#8B5CF6' },
  { name: 'Pink Rose (Bahasa)', hex: '#EC4899' },
  { name: 'Cokelat / Slate', hex: '#64748B' },
];

// Sub-divisi e-DDC Standar Perpusnas RI yang relevan untuk koleksi sekolah
export interface EddcSubdivision {
  code: string;
  mainClass: string;
  subject: string;
  examples: string;
  shelfSuggestion: string;
}

export const EDDC_DETAILED_SUBDIVISIONS: EddcSubdivision[] = [
  {
    code: '000',
    mainClass: '000 Karya Umum',
    subject: 'Karya Umum, Komputer & Informasi',
    examples: 'Mengenal Komputer untuk Anak, Ensiklopedia Digital',
    shelfSuggestion: 'Rak 000',
  },
  {
    code: '030',
    mainClass: '000 Karya Umum',
    subject: 'Ensiklopedia Umum & Almanak Anak',
    examples: 'Nat Geo 1.111 Tanya Jawab, Ensiklopedia Junior',
    shelfSuggestion: 'Rak 000',
  },
  {
    code: '100',
    mainClass: '100 Filsafat & Psikologi',
    subject: 'Filsafat Umum & Kepribadian',
    examples: 'Mengenal Diriku Sendiri, Siapakah Aku?',
    shelfSuggestion: 'Rak 100',
  },
  {
    code: '150',
    mainClass: '100 Filsafat & Psikologi',
    subject: 'Psikologi & Perkembangan Emosi Anak',
    examples: 'Saat Aku Marah, Saat Aku Takut, Mengenal Emosi',
    shelfSuggestion: 'Rak 100',
  },
  {
    code: '170',
    mainClass: '100 Filsafat & Psikologi',
    subject: 'Etika, Budi Pekerti & Sopan Santun',
    examples: 'Anak yang Jujur, Tolong & Terima Kasih, Adab Berteman',
    shelfSuggestion: 'Rak 100',
  },
  {
    code: '200',
    mainClass: '200 Agama',
    subject: 'Agama & Ketuhanan Umum',
    examples: 'Tuhan Menciptakan Semesta, Indahnya Berdoa',
    shelfSuggestion: 'Rak 200',
  },
  {
    code: '297',
    mainClass: '200 Agama',
    subject: 'Agama Islam (Rukun Iman, Sholat, Kisah Nabi)',
    examples: 'Asyiknya Belajar Rukun Islam, 25 Kisah Nabi Bergambar',
    shelfSuggestion: 'Rak 200',
  },
  {
    code: '230',
    mainClass: '200 Agama',
    subject: 'Agama Kristen & Katolik',
    examples: 'Kisah Kasih Yesus, Cerita Alkitab Bergambar Anak',
    shelfSuggestion: 'Rak 200',
  },
  {
    code: '300',
    mainClass: '300 Ilmu Sosial',
    subject: 'Ilmu Sosial, Hubungan Masyarakat & Keluarga',
    examples: 'Keluargaku Hebat, Gotong Royong di Lingkungan',
    shelfSuggestion: 'Rak 300',
  },
  {
    code: '372.2',
    mainClass: '300 Ilmu Sosial',
    subject: 'Pendidikan Anak Usia Dini (PAUD / TK)',
    examples: 'Siap Masuk TK, Belajar di Kelas yang Menyenangkan',
    shelfSuggestion: 'Rak 300',
  },
  {
    code: '398.2',
    mainClass: '300 Ilmu Sosial',
    subject: 'Cerita Rakyat & Fabel Nusantara (Folklor)',
    examples: 'Si Kancil & Buaya, Timun Mas, Bawang Merah Bawang Putih',
    shelfSuggestion: 'Rak 300 / Rak Fabel',
  },
  {
    code: '400',
    mainClass: '400 Bahasa',
    subject: 'Bahasa Umum & Mengenal Abjad',
    examples: 'Belajar Huruf A-Z, Fonik Ceria Anak Usia Dini',
    shelfSuggestion: 'Rak 400',
  },
  {
    code: '420',
    mainClass: '400 Bahasa',
    subject: 'Bahasa Inggris Anak (English for Kids)',
    examples: 'My First English Words, Little Explorers Vocabulary',
    shelfSuggestion: 'Rak 400',
  },
  {
    code: '495.1',
    mainClass: '400 Bahasa',
    subject: 'Bahasa Mandarin Anak (中文 / Pinyin)',
    examples: 'Cerita Anak Mandarin-Indonesia, Pinyin Bergambar',
    shelfSuggestion: 'Rak 400 (Trilingual)',
  },
  {
    code: '499.221',
    mainClass: '400 Bahasa',
    subject: 'Bahasa Indonesia (Kosakata & Tata Bahasa Cilik)',
    examples: 'Kamus Bergambar Anak Indonesia, Lancar Membaca Kata',
    shelfSuggestion: 'Rak 400',
  },
  {
    code: '500',
    mainClass: '500 Sains & Alam',
    subject: 'Sains Dasar & Eksperimen Sederhana',
    examples: 'Keajaiban Sains Anak, Eksperimen Seru Air dan Udara',
    shelfSuggestion: 'Rak 500',
  },
  {
    code: '510',
    mainClass: '500 Sains & Alam',
    subject: 'Matematika & Mengenal Angka',
    examples: 'Ayo Berhitung 1-100, Bentuk Bangun Datar Ceria',
    shelfSuggestion: 'Rak 500',
  },
  {
    code: '520',
    mainClass: '500 Sains & Alam',
    subject: 'Astronomi, Antariksa & Tata Surya',
    examples: 'Petualangan Menjelajah Bulan, Planet Tata Surya',
    shelfSuggestion: 'Rak 500',
  },
  {
    code: '560',
    mainClass: '500 Sains & Alam',
    subject: 'Fosil & Dinosaurus Purba',
    examples: 'Mengenal T-Rex dan Kawan-kawan, Dunia Dinosaurus',
    shelfSuggestion: 'Rak 500',
  },
  {
    code: '580',
    mainClass: '500 Sains & Alam',
    subject: 'Dunia Tanaman & Tumbuhan',
    examples: 'Biji Tumbuh Jadi Bunga, Pohon Sahabat Manusia',
    shelfSuggestion: 'Rak 500',
  },
  {
    code: '590',
    mainClass: '500 Sains & Alam',
    subject: 'Dunia Binatang & Satwa Liar',
    examples: 'Jika Aku Jadi Panda, Satwa Liar Indonesia, Hewan Laut',
    shelfSuggestion: 'Rak 500',
  },
  {
    code: '600',
    mainClass: '600 Teknologi',
    subject: 'Teknologi Terapan & Otomasi',
    examples: 'Robot Penolong, Bagaimana Listrik Bekerja?',
    shelfSuggestion: 'Rak 600',
  },
  {
    code: '610',
    mainClass: '600 Teknologi',
    subject: 'Kesehatan Tubuh, Dokter & Nutrisi',
    examples: 'Aku Ingin Menjadi Dokter, Gigi Bersih Senyum Sehat',
    shelfSuggestion: 'Rak 600',
  },
  {
    code: '620',
    mainClass: '600 Teknologi',
    subject: 'Kendaraan, Transportasi & Rekayasa',
    examples: 'Mobil Balap, Pesawat Terbang Raksasa, Kereta Api Cepat',
    shelfSuggestion: 'Rak 600',
  },
  {
    code: '640',
    mainClass: '600 Teknologi',
    subject: 'Keterampilan Rumah Tangga & Memasak',
    examples: 'Belajar Memasak Bersama Bella, Kreasi Kue Lezat',
    shelfSuggestion: 'Rak 600',
  },
  {
    code: '700',
    mainClass: '700 Kesenian',
    subject: 'Seni Kreatif & Kerajinan Tangan',
    examples: 'Melipat Kertas Origami Seru, Kreasi Plastisin Warna-warni',
    shelfSuggestion: 'Rak 700',
  },
  {
    code: '740',
    mainClass: '700 Kesenian',
    subject: 'Menggambar & Mewarnai',
    examples: 'Buku Mewarnai Hewan Lucu, Langkah Mudah Menggambar',
    shelfSuggestion: 'Rak 700',
  },
  {
    code: '780',
    mainClass: '700 Kesenian',
    subject: 'Musik & Lagu Anak Indonesia',
    examples: 'Lagu Anak Nusantara, Mengenal Piano dan Drum',
    shelfSuggestion: 'Rak 700',
  },
  {
    code: '790',
    mainClass: '700 Kesenian',
    subject: 'Olahraga, Senam & Permainan Edukatif',
    examples: 'Ayo Senam Sehat, Main Sepak Bola Gembira, Maze Teka-teki',
    shelfSuggestion: 'Rak 700',
  },
  {
    code: '800',
    mainClass: '800 Kesusastraan',
    subject: 'Kesusastraan & Cerita Fiksi Anak',
    examples: 'Smart Big Book 365 Dongeng, Cerita Pengantar Tidur',
    shelfSuggestion: 'Rak 800 (Fiksi)',
  },
  {
    code: '813',
    mainClass: '800 Kesusastraan',
    subject: 'Cerpen & Fiksi Anak Kontemporer',
    examples: 'Anak-Anak Kampung Stroberi, Petualangan di Negeri Awan',
    shelfSuggestion: 'Rak 800 (Fiksi)',
  },
  {
    code: '899.221',
    mainClass: '800 Kesusastraan',
    subject: 'Sastra Indonesia Anak & Puisi Cilik',
    examples: 'Kumpulan Cerita Dongeng Usia Dini, Puisi Bintang Kecil',
    shelfSuggestion: 'Rak 800',
  },
  {
    code: '900',
    mainClass: '900 Sejarah & Geografi',
    subject: 'Sejarah Dunia & Perjalanan',
    examples: 'Perjalanan Kapal Menjelajah Benua, Kisah Masa Lalu',
    shelfSuggestion: 'Rak 900',
  },
  {
    code: '910',
    mainClass: '900 Sejarah & Geografi',
    subject: 'Geografi, Peta & Atlas Anak',
    examples: 'Atlas Dunia Bergambar Junior, Keliling Indonesia',
    shelfSuggestion: 'Rak 900',
  },
  {
    code: '920',
    mainClass: '900 Sejarah & Geografi',
    subject: 'Biografi Tokoh & Pahlawan Teladan',
    examples: 'Kisah Ibu Kartini, Bung Karno Sang Pemimpin Cilik',
    shelfSuggestion: 'Rak 900',
  },
  {
    code: '959.8',
    mainClass: '900 Sejarah & Geografi',
    subject: 'Sejarah Perjuangan Indonesia',
    examples: 'Detik-Detik Kemerdekaan RI, Cerita Pahlawan Negeri Kita',
    shelfSuggestion: 'Rak 900',
  },
];

// ============================================================================
// HELPER AUTO-MATCHING KATEGORI DDC WAKTU SCAN ISBN / SEARCH BUKU
// Mencocokkan judul, sinopsis, penerbit, atau tag subjek ke kelas DDC yang pas
// ============================================================================
export function matchDdcCategory(
  title: string,
  synopsis: string = '',
  publisher: string = '',
  rawCategories: string = '',
  language: string = 'id'
): { categoryId: string; ddcCode: string; confidence: 'HIGH' | 'MEDIUM' | 'FALLBACK'; reason: string } {
  const text = `${title} ${synopsis} ${publisher} ${rawCategories}`.toLowerCase();

  // 1. DDC 400 - Bahasa (Mandarin, English, Fonik, Huruf Abjad)
  if (
    language === 'en' ||
    language === 'zh' ||
    language === 'bilingual' ||
    text.includes('english') ||
    text.includes('mandarin') ||
    text.includes('chinese') ||
    text.includes('pinyin') ||
    text.includes('中文') ||
    text.includes('fonik') ||
    text.includes('phonic') ||
    text.includes('belajar huruf') ||
    text.includes('abjad') ||
    text.includes('alphabet') ||
    text.includes('vocabulary') ||
    text.includes('bilingual')
  ) {
    return {
      categoryId: 'ddc-400',
      ddcCode: text.includes('english') ? '420' : text.includes('mandarin') || text.includes('chinese') ? '495.1' : '400',
      confidence: 'HIGH',
      reason: 'Terdeteksi buku bahasa/trilingual/fonik',
    };
  }

  // 2. DDC 200 - Agama & Doa
  if (
    text.includes('islam') ||
    text.includes('sholat') ||
    text.includes('doa') ||
    text.includes('quran') ||
    text.includes('nabi') ||
    text.includes('rasul') ||
    text.includes('mukjizat') ||
    text.includes('kristen') ||
    text.includes('alkitab') ||
    text.includes('gereja') ||
    text.includes('yesus') ||
    text.includes('hindu') ||
    text.includes('buddha') ||
    text.includes('rukun iman') ||
    text.includes('ibadah') ||
    text.includes('agama') ||
    text.includes('syariah') ||
    text.includes('pahala') ||
    text.includes('surga') ||
    text.includes('religion')
  ) {
    return {
      categoryId: 'ddc-200',
      ddcCode: text.includes('islam') || text.includes('nabi') || text.includes('sholat') ? '297' : '200',
      confidence: 'HIGH',
      reason: 'Terdeteksi konten doa/agama/kisah teladan religi',
    };
  }

  // 3. DDC 000 - Karya Umum, Komputer & Ensiklopedia
  if (
    text.includes('ensiklopedia') ||
    text.includes('encyclopedia') ||
    text.includes('almanak') ||
    text.includes('almanac') ||
    text.includes('1.111') ||
    text.includes('pertanyaan dan jawaban') ||
    text.includes('hiupedia') ||
    text.includes('kamus bergambar') ||
    text.includes('komputer') ||
    text.includes('fakta unik') ||
    text.includes('generalities')
  ) {
    return {
      categoryId: 'ddc-000',
      ddcCode: '030',
      confidence: 'HIGH',
      reason: 'Terdeteksi buku ensiklopedia / fakta pengetahuan / almanak',
    };
  }

  // 4. DDC 100 - Filsafat, Psikologi & Karakter
  if (
    text.includes('karakter') ||
    text.includes('budi pekerti') ||
    text.includes('jujur') ||
    text.includes('kejujuran') ||
    text.includes('sopan') ||
    text.includes('santun') ||
    text.includes('adab') ||
    text.includes('marah') ||
    text.includes('sedih') ||
    text.includes('takut') ||
    text.includes('senang') ||
    text.includes('emosi') ||
    text.includes('empati') ||
    text.includes('disiplin') ||
    text.includes('mandiri') ||
    text.includes('antre')
  ) {
    return {
      categoryId: 'ddc-100',
      ddcCode: '170',
      confidence: 'HIGH',
      reason: 'Terdeteksi buku pendidikan karakter & pengenalan emosi',
    };
  }

  // 5. DDC 500 - Sains, Alam, Satwa, Tumbuhan & Matematika
  if (
    text.includes('hewan') ||
    text.includes('binatang') ||
    text.includes('satwa') ||
    text.includes('fauna') ||
    text.includes('flora') ||
    text.includes('tumbuhan') ||
    text.includes('tanaman') ||
    text.includes('dinosaurus') ||
    text.includes('dino') ||
    text.includes('sains') ||
    text.includes('science') ||
    text.includes('alam') ||
    text.includes('bumi') ||
    text.includes('antariksa') ||
    text.includes('planet') ||
    text.includes('tata surya') ||
    text.includes('bintang') ||
    text.includes('matematika') ||
    text.includes('berhitung') ||
    text.includes('angka') ||
    text.includes('geographic') ||
    text.includes('survival') ||
    text.includes('laut') ||
    text.includes('hutan')
  ) {
    let sub = '500';
    if (text.includes('hewan') || text.includes('binatang') || text.includes('satwa')) sub = '590';
    else if (text.includes('dinosaurus') || text.includes('dino')) sub = '560';
    else if (text.includes('antariksa') || text.includes('planet')) sub = '520';
    else if (text.includes('matematika') || text.includes('hitung')) sub = '510';
    return {
      categoryId: 'ddc-500',
      ddcCode: sub,
      confidence: 'HIGH',
      reason: 'Terdeteksi sains alam / satwa / bumi / berhitung',
    };
  }

  // 6. DDC 600 - Teknologi, Tubuh Manusia, Kesehatan & Rekayasa
  if (
    text.includes('tubuh') ||
    text.includes('anatomi') ||
    text.includes('kesehatan') ||
    text.includes('dokter') ||
    text.includes('gigi') ||
    text.includes('kendaraan') ||
    text.includes('mobil') ||
    text.includes('pesawat') ||
    text.includes('kereta') ||
    text.includes('kapal') ||
    text.includes('alat berat') ||
    text.includes('mesin') ||
    text.includes('robot') ||
    text.includes('memasak') ||
    text.includes('resep') ||
    text.includes('nutrisi') ||
    text.includes('technology')
  ) {
    let sub = '600';
    if (text.includes('kesehatan') || text.includes('tubuh') || text.includes('dokter') || text.includes('gigi')) sub = '610';
    else if (text.includes('kendaraan') || text.includes('mobil') || text.includes('pesawat') || text.includes('kereta')) sub = '620';
    else if (text.includes('memasak')) sub = '640';
    return {
      categoryId: 'ddc-600',
      ddcCode: sub,
      confidence: 'HIGH',
      reason: 'Terdeteksi kesehatan tubuh / kendaraan / rekayasa',
    };
  }

  // 7. DDC 700 - Kesenian, Mewarnai, Musik, Origami & Olahraga
  if (
    text.includes('mewarnai') ||
    text.includes('menggambar') ||
    text.includes('lukis') ||
    text.includes('seni') ||
    text.includes('origami') ||
    text.includes('melipat') ||
    text.includes('kerajinan') ||
    text.includes('prakarya') ||
    text.includes('lagu') ||
    text.includes('musik') ||
    text.includes('nyanyi') ||
    text.includes('senam') ||
    text.includes('olahraga') ||
    text.includes('permainan') ||
    text.includes('maze') ||
    text.includes('art')
  ) {
    let sub = '700';
    if (text.includes('mewarnai') || text.includes('menggambar') || text.includes('lukis')) sub = '740';
    else if (text.includes('lagu') || text.includes('musik')) sub = '780';
    else if (text.includes('olahraga') || text.includes('senam') || text.includes('permainan')) sub = '790';
    return {
      categoryId: 'ddc-700',
      ddcCode: sub,
      confidence: 'HIGH',
      reason: 'Terdeteksi aktivitas seni / mewarnai / musik / kreativitas',
    };
  }

  // 8. DDC 900 - Sejarah, Geografi, Pahlawan & Peta
  if (
    text.includes('sejarah') ||
    text.includes('pahlawan') ||
    text.includes('biografi') ||
    text.includes('tokoh') ||
    text.includes('peta') ||
    text.includes('atlas') ||
    text.includes('keliling dunia') ||
    text.includes('geografi') ||
    text.includes('indonesia') && text.includes('merdeka') ||
    text.includes('history')
  ) {
    let sub = '900';
    if (text.includes('peta') || text.includes('atlas') || text.includes('geografi')) sub = '910';
    else if (text.includes('pahlawan') || text.includes('biografi') || text.includes('tokoh')) sub = '920';
    return {
      categoryId: 'ddc-900',
      ddcCode: sub,
      confidence: 'HIGH',
      reason: 'Terdeteksi sejarah / tokoh pahlawan / geografi dunia',
    };
  }

  // 9. DDC 300 - Ilmu Sosial, Dongeng Rakyat Nusantara & Sekolah
  if (
    text.includes('kancil') ||
    text.includes('timun mas') ||
    text.includes('cerita rakyat') ||
    text.includes('nusantara') ||
    text.includes('keluarga') ||
    text.includes('teman') ||
    text.includes('persahabatan') ||
    text.includes('sekolah') ||
    text.includes('paud') ||
    text.includes('masuk tk') ||
    text.includes('profesi') ||
    text.includes('polisi') ||
    text.includes('damkar')
  ) {
    let sub = '300';
    if (text.includes('kancil') || text.includes('rakyat') || text.includes('timun mas') || text.includes('bawang')) sub = '398.2';
    else if (text.includes('paud') || text.includes('tk') || text.includes('sekolah')) sub = '372.2';
    return {
      categoryId: 'ddc-300',
      ddcCode: sub,
      confidence: 'HIGH',
      reason: 'Terdeteksi fabel nusantara (398.2) atau ilmu sosial/sekolah (372.2)',
    };
  }

  // 10. DDC 800 - Kesusastraan, Cerita Bergambar & Dongeng Sedunia (Default Buku Cerita TK)
  if (
    text.includes('dongeng') ||
    text.includes('cerita') ||
    text.includes('fabel') ||
    text.includes('fiksi') ||
    text.includes('kisah') ||
    text.includes('putri') ||
    text.includes('pangeran') ||
    text.includes('tidur') ||
    text.includes('novel') ||
    text.includes('komik') ||
    text.includes('cerpen') ||
    text.includes('picture book') ||
    text.includes('cerita bergambar') ||
    text.includes('fiction')
  ) {
    return {
      categoryId: 'ddc-800',
      ddcCode: text.includes('fabel') || text.includes('kancil') ? '398.2' : '813',
      confidence: 'HIGH',
      reason: 'Terdeteksi buku dongeng / fabel / fiksi anak',
    };
  }

  // Fallback standar untuk buku TK
  return {
    categoryId: 'ddc-800',
    ddcCode: '813',
    confidence: 'FALLBACK',
    reason: 'Kategori standar buku cerita anak (DDC 800 / 813)',
  };
}

// ============================================================================
// EXPORT RESMI e-DDC KE FILE EXCEL (.XLSX)
// Menghasilkan file Excel resmi berformat rapi untuk diprint atau panduan rak
// ============================================================================
export function exportEddcToExcel(customCategories?: Category[]): void {
  const categoriesToExport = customCategories && customCategories.length > 0 ? customCategories : OFFICIAL_DDC_CATEGORIES;
  const wb = XLSX.utils.book_new();

  // Sheet 1: 10 Kelas Utama DDC & Warna Stiker SBTH
  const mainData = categoriesToExport.map((cat, idx) => ({
    'No': idx + 1,
    'Kode DDC': cat.ddcCode || cat.id.replace('ddc-', ''),
    'Nama Kelas Klasifikasi': cat.name,
    'Singkatan Punggung': cat.shortName,
    'Kode Rak Punggung': cat.shelfCode || 'SR',
    'Warna Stiker Hex': cat.colorHex,
    'Posisi Rak Fisik': cat.shelfLocation,
    'Deskripsi & Cakupan': cat.description,
  }));
  const ws1 = XLSX.utils.json_to_sheet(mainData);
  // Lebar kolom rapi
  ws1['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 45 },
    { wch: 18 },
    { wch: 15 },
    { wch: 16 },
    { wch: 35 },
    { wch: 60 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '10 Kelas Utama DDC SBTH');

  // Sheet 2: Sub-divisi e-DDC Detail Perpusnas RI
  const subData = EDDC_DETAILED_SUBDIVISIONS.map((sub, idx) => ({
    'No': idx + 1,
    'Kode Sub DDC': sub.code,
    'Kelas Utama': sub.mainClass,
    'Subjek / Bidang': sub.subject,
    'Contoh Judul Buku PAUD & TK': sub.examples,
    'Rekomendasi Label Rak': sub.shelfSuggestion,
  }));
  const ws2 = XLSX.utils.json_to_sheet(subData);
  ws2['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 25 },
    { wch: 35 },
    { wch: 55 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Subdivisi e-DDC Perpusnas');

  // Sheet 3: Panduan Penataan Fisik Label Punggung (7.4x4 cm) & Slip (6x2.5 cm)
  const guideData = [
    {
      'Petunjuk': 'Ukuran Label Punggung Buku',
      'Spesifikasi': '7.4 cm x 4.0 cm (Kotak Potong Manual)',
      'Keterangan': 'Dilengkapi KOP resmi SBTH (Logo di kiri, Tulisan di tengah), strip warna DDC, kotak 4-baris vertikal & barcode',
    },
    {
      'Petunjuk': 'Ukuran Slip Dalam Buku',
      'Spesifikasi': '6.0 cm x 2.5 cm (Kotak Potong Manual)',
      'Keterangan': 'Dilengkapi KOP resmi SBTH, No. Daftar 4-digit angka (contoh: 0102) & Tanggal (DD/MM/YYYY)',
    },
    {
      'Petunjuk': 'Format KOP Resmi SBTH',
      'Spesifikasi': 'Baris 1: PERPUSTAKAAN KB-TK BHAKTI TUNAS HARAPAN | Baris 2: Jl. Jendral Sudirman No 68 A Magelang',
      'Keterangan': 'Seragam di seluruh stiker punggung dan slip dalam buku',
    },
    {
      'Petunjuk': 'Kertas Cetak Rekomendasi',
      'Spesifikasi': 'Kertas HVS A4 / Stiker HVS A4 80-100 gsm',
      'Keterangan': 'Pilih Margin: None/Kosong dan Scale: 100% pada jendela browser print agar ukuran pas presisi',
    },
  ];
  const ws3 = XLSX.utils.json_to_sheet(guideData);
  ws3['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Panduan Cetak Presisi');

  // Simpan file
  XLSX.writeFile(wb, 'Skema_Resmi_eDDC_Perpustakaan_SBTH.xlsx');
}

// Resolver untuk memetakan ID lama (cat-dongeng, dll) ke ID DDC baru
export function resolveToDdcCategoryId(oldOrNewId?: string): string {
  if (!oldOrNewId) return 'ddc-800';
  if (oldOrNewId.startsWith('ddc-')) return oldOrNewId;
  const legacyMap: Record<string, string> = {
    'cat-dongeng': 'ddc-800',
    'cat-alam': 'ddc-500',
    'cat-aktivitas': 'ddc-700',
    'cat-karakter': 'ddc-100',
    'cat-ensiklopedia': 'ddc-000',
    'cat-bahasa': 'ddc-400',
  };
  return legacyMap[oldOrNewId] || oldOrNewId;
}
