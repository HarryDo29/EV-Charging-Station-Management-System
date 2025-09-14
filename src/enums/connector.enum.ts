export enum ConnectorType {
  TYPE1 = 'SAE J1772 Type1', // SAE J1772 (AC, Mỹ, Nhật)
  TYPE2 = 'Mennekes Type2', // Mennekes (AC, EU, VN, phổ biến)
  CHADEMO = 'CHAdeMO', // Nhật, sạc nhanh DC
  CCS1 = 'CCS1', // Mỹ, kết hợp Type1 + DC
  CCS2 = 'CCS2', // EU, VN, phổ biến nhất cho DC fast charge
  GBT = 'GB/T', // Chuẩn Trung Quốc (AC/DC)
  TESLA = 'Tesla', // Chuẩn riêng của Tesla (ở EU giờ dùng CCS2)
}
