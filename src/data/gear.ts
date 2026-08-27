export interface GearItem {
  name: string;
  role?: string;
  specs?: string | string[];
  description?: string;
  link?: string;
}

export interface GearCategory {
  category: string;
  icon?: string;
  items: GearItem[];
}

export const gearCategories: GearCategory[] = [
  {
    category: "Workstation & Devices",
    icon: "💻",
    items: [
      {
        name: "Custom Desktop PC",
        role: "Main Workstation",
        specs: [
          "CPU : AMD Ryzen 5 7600",
          "RAM : SAMSUNG DDR5-5600 (16GB) x2",
          "GPU : RTX 5070",
          "SSD : SK hynix Platinum P41 M.2 NVMe (1TB)",
        ],
      },
      {
        name: "MacBook Air 13\" (M5)",
        role: "Laptop",
        specs: "Apple M5 Chip / Light & Powerful",
      },
      {
        name: "iPhone 16 Pro",
        role: "Daily Smartphone",
        specs: "A18 Pro / Super Retina XDR",
      },
    ],
  },
  {
    category: "Displays",
    icon: "🖥️",
    items: [
      {
        name: "Acer Nitro XV272U W2",
        role: "Main Display",
        specs: "27\" WQHD (2560x1440) / 240Hz / Fast IPS",
        description: "선명한 QHD 해상도와 부드러운 240Hz 고주사율을 지원하는 메인 모니터",
      },
    ],
  },
  {
    category: "Keyboards & Pointing Devices",
    icon: "⌨️",
    items: [
      {
        name: "VENOM 60HE",
        role: "Main Keyboard",
        specs: "Magnetic Switch (HE) / Rapid Trigger / 60% Layout",
        description: "래피드 트리거와 자석축의 빠른 응답성을 갖춘 커스텀 60% 키보드",
      },
      {
        name: "Logitech G PRO X2 SUPERSTRIKE",
        role: "Main Mouse",
        specs: "HERO Sensor / LIGHTSPEED Wireless / Ultra-light",
        description: "가볍고 빠른 반응속도와 정밀한 제어를 갖춘 무선 게이밍 마우스",
      },
    ],
  },
  {
    category: "Audio",
    icon: "🎧",
    items: [
      {
        name: "AirPods Pro 2",
        role: "Earbuds",
        specs: "H2 Chip / Active Noise Cancellation / USB-C",
      },
      {
        name: "Edifier MR4 MK2",
        role: "Speaker",
        specs: "Active 2.0 Studio Monitor Speakers",
      },
    ],
  },
];
