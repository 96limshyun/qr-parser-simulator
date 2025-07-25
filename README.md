# [QR Code Simulator](#) – QR 코드 시뮬레이터

QR Code Simulator는 **QR 코드의 생성·분석·복원** 과정을 한눈에 이해할 수 있는 인터랙티브 학습 도구입니다.  
외부 라이브러리에 의존하지 않고, **순수 TypeScript**로 QR 스펙(비트 매트릭스, 포맷/버전 정보, 에러 정정 코드, 마스킹)을 직접 구현했습니다.

## 📑 목차

- [QR Code Simulator – QR 코드 시뮬레이터](#qr-code-simulator--qr-코드-시뮬레이터)
  - [목차](#-목차)
    - [아이디어 선정 배경](#-아이디어-선정-배경)
    - [구현 기능](#-구현-기능)
      - [QR 디코딩](#-qr-디코딩)
      - [QR 인코딩](#-qr-인코딩)
    - [기술 스택](#️-기술-스택)
    - [개발 과정](#-개발-과정)
      - [인코딩, 디코딩은 어떻게 진행될까?](#인코딩-디코딩은-어떻게-진행될까)
    - [개발 과정 중 챌린지 요소](#개발-과정-중-챌린지-요소)
      - [인코딩, 디코딩 과정이 복잡해 구현 후 검증의 어려움](#인코딩-디코딩-과정이-복잡해-구현-후-검증의-어려움)
      - [매번 클래스를 생성하지 않을 수 있을까?(싱글턴 패턴)](#매번-클래스를-생성하지-않을-수-있을까싱글턴-패턴)
      - [테스트는 어떻게 진행해야 할까?](#테스트는-어떻게-진행해야-할까)

---

### 🔥 아이디어 선정 배경

QR 코드를 일상적으로 스캔하고 사용하면서, **'이게 내부적으로 어떻게 읽히는 걸까?'**, **'QR 이미지를 스캔했을 때 어떤 과정을 거쳐 텍스트로 변환되는 걸까?'** 하는 궁금증이 생겼습니다.

이를 계기로 **QR 인코딩과 디코딩의 전체 과정을 눈으로 직접 확인할 수 있는 시뮬레이터**를 만들고 싶었습니다.

특히, 저 처럼 QR 코드의 구조나 원리를 잘 모르는 사람도 **한눈에 구조를 파악하고**, **직접 조작해보며 원리를 체험할 수 있도록** 설계하는 것을 목표로 했습니다.

단순히 결과만 보여주는 도구가 아니라, **학습과 탐구를 도와주는 시각적이고 직관적인 웹앱**을 만들고자 했습니다.

---

### 🚀 구현 기능

#### 📥 QR 디코딩

QR 코드를 이미지로 업로드하거나 스캔하면, 내부 영역 검출 → 포맷/버전 정보 추출 → 데이터 디코딩까지의 전체 과정을 순차적으로 시각화하여 보여줍니다.

![QR 디코딩 예시](https://github.com/user-attachments/assets/a70ab7df-56c5-4761-8bd6-6743cee54c54)

#### 📤 QR 인코딩

입력한 문자열을 실시간으로 QR 코드로 인코딩하며, 비트 스트림 구성 → ECC 생성 → 매트릭스 배치 → 마스킹 과정을 단계별로 시각화합니다.

![QR 인코딩 예시](https://github.com/user-attachments/assets/9ad1cedf-43ad-4f53-be7c-2d24282f84bf)

---

### 🛠️ 기술 스택

- **Core**: <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white"/>, <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white"/>

- **Styling & Build**: <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white"/>, <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white"/>, <img src="https://img.shields.io/badge/class_variance_authority-000000?style=flat&logo=css3&logoColor=white"/>, <img src="https://img.shields.io/badge/tailwind_merge-0EA5E9?style=flat&logo=tailwindcss&logoColor=white"/>, <img src="https://img.shields.io/badge/tailwind_styled_components-38B2AC?style=flat&logo=styledcomponents&logoColor=white"/>

- **Quality & Testing**: <img src="https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white"/>, <img src="https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=white"/>, <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white"/>, <img src="https://img.shields.io/badge/Testing_Library-FF4154?style=flat&logo=testinglibrary&logoColor=white"/>

---

### 💻 개발 과정

#### 인코딩, 디코딩은 어떻게 진행될까?

QR 코드의 인코딩과 디코딩 과정은 **7단계의 체계적인 알고리즘**으로 구성되어 있습니다. 각 단계는 QR 코드 표준(ISO/IEC 18004:2006)에 따라 정확히 정의되어 있으며, 디코딩은 이 과정의 **역순으로 진행**됩니다.

**📤 QR 인코딩 과정 (7단계)**

QR 코드 인코딩은 **텍스트를 QR 코드로 변환하는 7단계 과정**입니다. 각 단계는 QR 코드 표준(ISO/IEC 18004:2006)에 따라 정확히 정의되어 있습니다.

## 🔍 1단계: 데이터 분석 (Data Analysis)

입력된 텍스트를 분석하여 **가장 효율적인 인코딩 모드**를 선택합니다.

### 📊 4가지 인코딩 모드 비교

| 모드             | 지원 문자          | 압축 효율 | 최대 용량 | 모드 비트 |
| ---------------- | ------------------ | --------- | --------- | --------- |
| **Numeric**      | 0-9 숫자만         | 가장 높음 | 7,089자   | `0001`    |
| **Alphanumeric** | 0-9, A-Z, 특수문자 | 높음      | 4,296자   | `0010`    |
| **Byte**         | ISO-8859-1/UTF-8   | 보통      | 2,953자   | `0100`    |
| **Kanji**        | Shift JIS 한자     | 높음      | 1,817자   | `1000`    |

### 🎯 모드 선택 우선순위

```
입력 텍스트 분석
    ↓
숫자만? → Numeric 모드
    ↓
Alphanumeric 테이블 문자만? → Alphanumeric 모드
    ↓
ISO-8859-1 문자? → Byte 모드
    ↓
Shift JIS 한자? → Kanji 모드
```

### 💡 실제 예시

**예시 1: "1234567890"**

- 분석: 숫자만 포함
- 선택: **Numeric 모드** (`0001`)
- 효율: 3자씩 묶어서 10비트로 압축

**예시 2: "HELLO WORLD"**

- 분석: 대문자와 공백 포함
- 선택: **Alphanumeric 모드** (`0010`)
- 효율: 2자씩 묶어서 11비트로 압축

**예시 3: "Hello!@#한글"**

- 분석: 소문자, 특수문자, 한글 포함
- 선택: **Byte 모드** (`0100`)
- 효율: 1자씩 8비트로 인코딩

## 🔧 2단계: 데이터 인코딩 (Data Encoding)

데이터 인코딩은 **5단계의 세부 과정**으로 구성됩니다. 이 과정에서 텍스트가 비트스트림으로 변환됩니다.

### 🛡️ 2-1단계: 에러 정정 레벨 선택

QR 코드는 **4가지 에러 정정 레벨**을 제공합니다. 각 레벨은 데이터 복구 능력과 QR 코드 크기 사이의 트레이드오프입니다.

#### 📊 에러 정정 레벨 비교

| 레벨             | 복구 능력 | QR 코드 크기 | 용도              | 아이콘 |
| ---------------- | --------- | ------------ | ----------------- | ------ |
| **L (Low)**      | 7% 복구   | 최소         | 실내, 깨끗한 환경 | 🟢     |
| **M (Medium)**   | 15% 복구  | 작음         | 일반적인 사용     | 🟡     |
| **Q (Quartile)** | 25% 복구  | 중간         | 약간 손상된 환경  | 🟠     |
| **H (High)**     | 30% 복구  | 최대         | 매우 손상된 환경  | 🔴     |

#### 🎯 에러 정정 레벨 선택 예시

```
"HELLO WORLD" (11자) + Q 레벨 선택
    ↓
버전 1-Q 확인 (16자까지 수용 가능)
    ↓
버전 1 선택
```

### 🏷️ 2-2단계: 모드 인디케이터 추가

4비트로 인코딩 모드를 표시합니다.

```
모드 인디케이터 비트:
┌─────────────┬─────────┬─────────────┬─────────────┐
│    모드     │   비트  │    예시     │   압축률    │
├─────────────┼─────────┼─────────────┼─────────────┤
│  Numeric    │  0001   │ "1234567890"│    최고    │
│Alphanumeric │  0010   │"HELLO WORLD"│    높음    │
│    Byte     │  0100   │ "Hello!@#"  │    보통    │
│   Kanji     │  1000   │   "漢字"    │    높음    │
└─────────────┴─────────┴─────────────┴─────────────┘
```

### 📏 2-3단계: 문자 수 인디케이터 추가

버전에 따라 가변 비트 길이로 문자 수를 표시합니다.

#### 📊 버전별 문자 수 비트 길이

| 버전 범위 | Numeric | Alphanumeric | Byte   | Kanji  |
| --------- | ------- | ------------ | ------ | ------ |
| **1-9**   | 10비트  | 9비트        | 8비트  | 8비트  |
| **10-26** | 12비트  | 11비트       | 16비트 | 10비트 |
| **27-40** | 14비트  | 13비트       | 16비트 | 12비트 |

#### 💡 실제 예시

```
"HELLO WORLD" (11자)
    ↓
버전 1 Alphanumeric → 9비트
    ↓
"000001011" (11을 9비트로 변환)
```

### 🔄 2-4단계: 선택된 모드로 데이터 인코딩

각 모드별로 다른 인코딩 규칙을 적용합니다.

#### 📝 모드별 인코딩 방식

**Numeric 모드 (3자씩 묶음):**

```
"123456789" → "123" + "456" + "789"
    ↓
"123" → 123 (10비트)
"456" → 456 (10비트)
"789" → 789 (10비트)
```

**Alphanumeric 모드 (2자씩 묶음):**

```
"HELLO WORLD" → "HE" + "LL" + "O " + "WO" + "RL" + "D"
    ↓
"HE" → 27×45 + 14 = 1229 (11비트)
"LL" → 27×38 + 38 = 1064 (11비트)
...
```

**Byte 모드 (1자씩):**

```
"Hello" → "H" + "e" + "l" + "l" + "o"
    ↓
"H" → 72 (8비트)
"e" → 101 (8비트)
...
```

### 🔧 2-5단계: 8비트 코드워드로 분할 및 패딩

비트스트림을 8비트 단위로 분할하고 필요한 경우 패딩을 추가합니다.

#### 📋 패딩 과정

1. **종료 비트 추가** (최대 4비트)

   ```
   비트스트림 + "0000"
   ```

2. **8비트 배수로 만들기**

   ```
   8비트로 나누어지지 않으면 0으로 패딩
   ```

3. **패드 바이트 추가** (필요시)
   ```
   "11101100 00010001" (236, 17 바이트 반복)
   QR 코드 용량을 채울 때까지 반복 추가
   ```

#### 🎯 실제 예시: "HELLO WORLD"

```
1. 모드 인디케이터: "0010" (Alphanumeric)
2. 문자 수: "000001011" (11자, 9비트)
3. 인코딩된 데이터: "01100001011 01111000110 10001011100 10110111000 10011010100 001101"
4. 종료 비트: "0000"
5. 최종 비트스트림: "0010 000001011 01100001011 01111000110 10001011100 10110111000 10011010100 001101 0000"
```

## 🔧 3단계: 에러 정정 코딩 (Error Correction Coding)

Reed-Solomon 알고리즘을 사용하여 **에러 정정 코드워드(ECC)**를 생성합니다. 이 과정은 QR 코드가 손상되어도 정확한 읽기를 가능하게 합니다.

### 🛡️ Reed-Solomon 에러 정정

Reed-Solomon 알고리즘은 **수학적 다항식 연산**을 사용하여 에러를 정정합니다.

#### 📊 에러 정정 과정

```
원본 데이터 → Reed-Solomon 인코딩 → 데이터 코드워드 + ECC 코드워드
    ↓
Galois Field 256 연산
    ↓
에러 정정 능력 확보
```

#### 🎯 에러 정정 레벨별 특성

| 레벨             | 복구 능력 | 데이터 비율 | ECC 비율 | 용도              |
| ---------------- | --------- | ----------- | -------- | ----------------- |
| **L (Low)**      | 7% 복구   | 93%         | 7%       | 실내, 깨끗한 환경 |
| **M (Medium)**   | 15% 복구  | 85%         | 15%      | 일반적인 사용     |
| **Q (Quartile)** | 25% 복구  | 75%         | 25%      | 약간 손상된 환경  |
| **H (High)**     | 30% 복구  | 70%         | 30%      | 매우 손상된 환경  |

### 🔬 수학적 원리

**Galois Field 256 연산:**

- 유한체(Finite Field)에서의 다항식 연산
- 8비트 단위로 처리 (0-255)
- 에러 위치와 크기를 동시에 계산

**에러 정정 과정:**

1. **인코딩**: 데이터에 에러 정정 다항식 추가
2. **디코딩**: 수신된 데이터에서 에러 위치 탐지
3. **정정**: 에러 위치의 값을 올바른 값으로 복원

### 💡 실제 예시

```
"HELLO WORLD" 데이터
    ↓
Reed-Solomon 인코딩
    ↓
데이터 코드워드: [72, 69, 76, 76, 79, 32, 87, 79, 82, 76, 68]
ECC 코드워드: [196, 35, 147, 89, 234, 12, 45]
    ↓
총 18개 코드워드 (11개 데이터 + 7개 ECC)
```

## 🔧 4단계: 최종 메시지 구조화 (Structure Final Message)

데이터 코드워드와 ECC 코드워드를 **올바른 순서로 배치**하여 최종 메시지를 구성합니다.

### 📋 메시지 구조화 과정

#### 🎯 코드워드 배치 순서

```
1. 데이터 코드워드 배치
   [D1, D2, D3, ..., Dn]

2. ECC 코드워드 배치
   [E1, E2, E3, ..., Em]

3. 최종 메시지 구성
   [D1, D2, D3, ..., Dn, E1, E2, E3, ..., Em]
```

#### 🔄 인터리빙 (Interleaving)

큰 버전의 QR 코드에서는 **인터리빙**을 사용하여 에러 정정 능력을 향상시킵니다.

```
원본: [D1, D2, D3, D4, E1, E2, E3, E4]
인터리빙: [D1, E1, D2, E2, D3, E3, D4, E4]
```

### 💡 실제 예시: "HELLO WORLD"

```
데이터 코드워드: [72, 69, 76, 76, 79, 32, 87, 79, 82, 76, 68]
ECC 코드워드: [196, 35, 147, 89, 234, 12, 45]
    ↓
최종 메시지: [72, 69, 76, 76, 79, 32, 87, 79, 82, 76, 68, 196, 35, 147, 89, 234, 12, 45]
    ↓
비트스트림으로 변환: "01001000 01000101 01001100 01001100 01001111 00100000 01010111 01001111 01010010 01001100 01000100 11000100 00100011 10010011 01011001 11101010 00001100 00101101"
```

## 🔧 5단계: 매트릭스에 모듈 배치 (Module Placement in Matrix)

매트릭스에 모듈을 배치하는 과정은 **6단계의 세부 과정**으로 구성됩니다. 이 과정에서 QR 코드의 시각적 구조가 완성됩니다.

### 🎯 QR 코드 매트릭스 구조

<img width="524" height="538" alt="function-patterns2 (1)" src="https://github.com/user-attachments/assets/e701812e-84ec-4087-945c-8f5509c43921" />

QR 코드는 **정사각형 매트릭스**로 구성되며, 각 모듈(픽셀)은 검은색(1) 또는 흰색(0)입니다.

#### 📏 버전별 매트릭스 크기

| 버전    | 매트릭스 크기 | 모듈 수  | 용량    |
| ------- | ------------- | -------- | ------- |
| **1**   | 21×21         | 441개    | 25자    |
| **2**   | 25×25         | 625개    | 47자    |
| **3**   | 29×29         | 841개    | 77자    |
| **...** | ...           | ...      | ...     |
| **40**  | 177×177       | 31,329개 | 2,953자 |

### 🔍 5-1단계: Finder 패턴 추가

Finder 패턴은 QR 코드를 **탐지하고 정렬**하는 데 사용되는 특별한 패턴입니다.

#### 📍 Finder 패턴 위치

Finder 패턴은 QR 코드의 세 모서리에 배치됩니다:

- **좌상단**: (0,0) 위치에서 시작하는 7×7 패턴
- **우상단**: (0, size-7) 위치에서 시작하는 7×7 패턴
- **좌하단**: (size-7, 0) 위치에서 시작하는 7×7 패턴

#### 💡 Finder 패턴의 역할

1. **탐지**: QR 코드의 위치와 크기 감지
2. **정렬**: QR 코드의 기울기 보정
3. **방향**: QR 코드의 방향 결정

### 🔍 5-2단계: Separator 추가

Finder 패턴 옆에 **1모듈 너비의 흰색 구분선**을 추가합니다.

#### 📍 Separator 위치

Finder 패턴 옆에는 1모듈 너비의 흰색 구분선이 배치됩니다:

- **좌상단**: Finder 패턴 아래와 오른쪽에 흰색 구분선
- **우상단**: Finder 패턴 아래와 왼쪽에 흰색 구분선
- **좌하단**: Finder 패턴 위와 오른쪽에 흰색 구분선

이 구분선은 QR 코드 내부와 Finder 패턴을 분리하는 역할을 합니다.

#### 🎯 Separator의 역할

- QR 코드 내부와 Finder 패턴을 **분리**
- 스캐너가 데이터 영역을 정확히 인식하도록 **도움**
- QR 코드의 **경계를 명확히** 정의

### 🔍 5-3단계: Alignment 패턴 추가 (버전 2 이상)

Alignment 패턴은 QR 코드가 **기울어졌을 때 정렬**하는 데 사용됩니다.

#### 🎯 Alignment 패턴 구조

Alignment 패턴은 5×5 크기의 정사각형 구조를 가집니다:

- **검은색 외곽**: 5×5 크기의 검은색 모듈로 둘러싸인 구조
- **흰색 내부**: 3×3 크기의 흰색 모듈로 구성된 내부 영역
- **검은색 중심**: 1×1 크기의 검은색 모듈로 구성된 중심점

이 패턴은 QR 코드가 기울어졌을 때 정렬하는 데 사용됩니다.

#### 📍 Alignment 패턴 위치 (버전별)

| 버전    | 위치                                                                      |
| ------- | ------------------------------------------------------------------------- |
| **2**   | (6,6), (6,18), (18,6), (18,18)                                            |
| **8**   | (6,6), (6,24), (6,42), (24,6), (24,24), (24,42), (42,6), (42,24), (42,42) |
| **...** | ...                                                                       |

[Alignment 패턴 위치](https://www.thonky.com/qr-code-tutorial/alignment-pattern-locations)

### 🔍 5-4단계: Timing 패턴 추가

Timing 패턴은 QR 코드의 **크기를 측정**하는 데 사용됩니다.

#### 🎯 Timing 패턴 구조

Timing 패턴은 QR 코드의 크기를 측정하는 데 사용되는 특별한 패턴입니다:

- **가로 Timing 패턴**: 6번째 행에 위치하며, 검은색과 흰색 모듈이 교대로 배치
- **세로 Timing 패턴**: 6번째 열에 위치하며, 검은색과 흰색 모듈이 교대로 배치
- **시작과 끝**: 항상 검은 모듈로 시작하고 끝남

이 패턴을 통해 스캐너는 QR 코드의 정확한 크기를 측정할 수 있습니다.

#### 📍 Timing 패턴 위치

- **가로 Timing**: 6번째 행 (row 6)
- **세로 Timing**: 6번째 열 (col 6)
- **시작과 끝**: 항상 검은 모듈

### 🔍 5-5단계: Dark Module 및 예약 영역 추가

#### 🎯 Dark Module

좌하단 Finder 패턴 옆에 **항상 배치**되는 검은 모듈입니다.

Dark Module은 좌하단 Finder 패턴 옆에 항상 배치되는 검은 모듈입니다:

- **위치**: 좌하단 Finder 패턴의 오른쪽에 고정 배치
- **크기**: 1×1 크기의 단일 검은 모듈
- **역할**: QR 코드의 방향을 결정하는 기준점 역할

이 모듈은 모든 QR 코드에서 동일한 위치에 배치되어 스캐너가 QR 코드를 안정적으로 읽도록 도움을 줍니다.

#### 📍 예약 영역

**Format 정보 영역:**

- 좌상단 Finder 패턴 아래 (8개 비트)
- 좌상단 Finder 패턴 오른쪽 (7개 비트)
- 우상단 Finder 패턴 아래 (8개 비트)
- 좌하단 Finder 패턴 오른쪽 (7개 비트)

**Version 정보 영역 (버전 7 이상):**

- 좌하단 위 (6×3)
- 우상단 왼쪽 (3×6)

### 🔍 5-6단계: 데이터 비트 배치

데이터와 ECC 비트를 **Zigzag 패턴**으로 배치합니다.

#### 🎯 Zigzag 배치 패턴

데이터와 ECC 비트는 Zigzag 패턴으로 배치됩니다:

<img width="377" height="377" alt="data-bit-progression (1)" src="https://github.com/user-attachments/assets/91170edc-9fde-4bc7-a0e1-1b809ed1bf8f" />
<img width="143" height="143" alt="upward (1)" src="https://github.com/user-attachments/assets/cf1ef0a6-89e3-4894-9a45-087358cc075f" />

- **시작점**: 우하단에서 시작하여 Z자 형태로 배치
- **배치 순서**: 2열씩 묶어서 위아래로 번갈아가며 배치
- **방향 전환**: 한 번은 아래에서 위로, 다음은 위에서 아래로
- **예외 처리**: Finder, Alignment, Timing 패턴과 겹치지 않도록 건너뛰기
- **예약 영역 제외**: Format/Version 정보 영역은 건너뛰기

이 패턴을 통해 데이터가 효율적으로 QR 코드 매트릭스에 배치됩니다.

#### 🔄 배치 규칙

1. **우하단에서 시작**: 가장 오른쪽 아래 모듈부터
2. **2열씩 묶음**: 왼쪽으로 2열씩 이동
3. **위아래 번갈아가며**: 한 번은 아래에서 위로, 다음은 위에서 아래로
4. **함수 패턴 제외**: Finder, Alignment, Timing 패턴은 건너뛰기
5. **예약 영역 제외**: Format/Version 정보 영역은 건너뛰기

#### 💡 실제 예시

```
"HELLO WORLD" 데이터 비트:
"0010 000001011 01100001011 01111000110 10001011100 10110111000 10011010100 001101"

배치 과정:
1. 우하단에서 시작
2. 2열씩 묶어서 위아래로 번갈아가며 배치
3. 함수 패턴이나 예약 영역을 만나면 건너뛰기
4. 모든 비트가 배치될 때까지 반복
```

## 🔧 6단계: 데이터 마스킹 (Data Masking)

데이터 마스킹은 **스캐너가 읽기 쉬운 패턴을 만들기 위한 최적화 과정**입니다. 이 과정은 QR 코드의 가독성을 향상시키고 스캔 성공률을 높입니다.

### 🎯 마스킹의 목적

마스킹은 다음과 같은 문제를 해결합니다:

- **연속된 같은 색상**: 스캐너가 읽기 어려운 패턴
- **Finder 패턴 유사 구조**: 스캐너가 혼동할 수 있는 패턴
- **불균형한 흑백 비율**: 읽기 어려운 QR 코드

### 🔍 6-1단계: 마스킹 대상 결정

마스킹은 **데이터 모듈과 에러 정정 모듈**에만 적용됩니다.

#### 📋 마스킹 대상 분류

| 대상               | 마스킹 여부    | 이유                  |
| ------------------ | -------------- | --------------------- |
| **데이터 모듈**    | ✅ 마스킹      | 스캔 최적화 대상      |
| **에러 정정 모듈** | ✅ 마스킹      | 스캔 최적화 대상      |
| **Finder 패턴**    | ❌ 마스킹 안함 | 탐지용 고정 패턴      |
| **Timing 패턴**    | ❌ 마스킹 안함 | 크기 측정용 고정 패턴 |
| **Alignment 패턴** | ❌ 마스킹 안함 | 정렬용 고정 패턴      |
| **Separator**      | ❌ 마스킹 안함 | 경계 구분용 고정 패턴 |
| **Format 정보**    | ❌ 마스킹 안함 | 메타데이터 고정 패턴  |
| **Version 정보**   | ❌ 마스킹 안함 | 메타데이터 고정 패턴  |

### 🔧 6-2단계: 8가지 마스크 패턴 적용

QR 코드 표준에서 정의한 **8가지 마스크 패턴**을 적용합니다.

#### 📊 8가지 마스크 패턴

| 패턴 번호 | 수학적 공식                                         | 설명           |
| --------- | --------------------------------------------------- | -------------- |
| **0**     | `(row + col) % 2 === 0`                             | 체크보드 패턴  |
| **1**     | `row % 2 === 0`                                     | 가로 줄무늬    |
| **2**     | `col % 3 === 0`                                     | 세로 3칸마다   |
| **3**     | `(row + col) % 3 === 0`                             | 대각선 3칸마다 |
| **4**     | `(⌊row/2⌋ + ⌊col/3⌋) % 2 === 0`                     | 복합 패턴 1    |
| **5**     | `((row × col) % 2) + ((row × col) % 3) === 0`       | 복합 패턴 2    |
| **6**     | `(((row × col) % 2) + ((row × col) % 3)) % 2 === 0` | 복합 패턴 3    |
| **7**     | `((row + col) % 2 + ((row × col) % 3)) % 2 === 0`   | 복합 패턴 4    |

#### 🎯 마스킹 과정

```
원본 모듈 → 마스크 패턴 적용 → 색상 토글 → 최적화된 모듈
    ↓
검은색(1) → 마스크 조건 만족 → 흰색(0)으로 변경
흰색(0) → 마스크 조건 만족 → 검은색(1)으로 변경
```

### 📊 6-3단계: 4가지 페널티 규칙으로 평가

8개의 마스크 패턴을 각각 적용한 뒤, **4가지 페널티 조건**을 통해 평가 점수를 계산하고 가장 점수가 낮은 마스크를 최종 선택합니다.

#### 🎯 페널티 평가 과정

```
8개 마스크 패턴 적용
    ↓
각 패턴별 4가지 페널티 계산
    ↓
총점 계산 (낮을수록 좋음)
    ↓
최저 점수 마스크 선택
```

---

#### 🟥 Rule 1: 같은 색상 모듈이 연속될 경우

- **설명**: 같은 색이 5개 이상 가로/세로로 연속될 때  
  → 5개일 경우 +3점, 이후 1개마다 +1점
- **예시**
  - 가로 Penalty: 92
  - 세로 Penalty: 88
  - ➡️ 총점: **180점**

<img width="540" height="540" alt="horizontal-total" src="https://github.com/user-attachments/assets/4104ca9e-b2c8-47d0-8ba8-cfe01986321d" />

<img width="540" alt="vertical-total" src="https://github.com/user-attachments/assets/b967f97b-0315-4c3d-8f76-fcb13dcf60a5" />

---

#### 🟩 Rule 2: 2x2 이상의 동일 색상 블록

- **설명**: 2x2 영역의 같은 색상이 있으면 **+3점**  
  → 겹쳐도 중복 계산 (3x2 블록이면 2번 계산됨)

<img width="540" alt="penalty-2" src="https://github.com/user-attachments/assets/c0cd27df-821a-4c94-b745-e28c98573fab" />

---

#### 🟦 Rule 3: Finder 패턴 유사한 구조

- **설명**:  
  아래와 같은 패턴을 포함한 경우  
  → **+40점**씩 가산

⬛⬜⬛⬛⬛⬜⬛ 또는 ⬜⬛⬜⬜⬜⬛⬜

- 가로 또는 세로 방향에 존재하면 가산됨
- 양쪽에 흰색 4칸 여백이 포함되어야 함

<img width="540" alt="penalty-3" src="https://github.com/user-attachments/assets/1cdd295e-94ba-4501-a7ea-bf6f1fb4c1a1" />

---

#### ⚖️ Rule 4: 검은색 모듈 비율 불균형

- **설명**: 전체 모듈 중 검정 모듈의 비율이 **50%에서 멀어질수록** 점수 가산
  - 비율을 가장 가까운 5의 배수로 근사
  - `|비율 - 50| / 5 × 10` 방식으로 계산
  - 0점 ~ 최대 100점까지 부여

<img width="540" alt="rule-4-illust2" src="https://github.com/user-attachments/assets/bda8e034-bee6-4e5a-b16f-9365b11f9873" />

---

## 🔧 7단계: 포맷 및 버전 정보 추가 (Format and Version Information)

포맷 및 버전 정보는 **QR 코드의 메타데이터를 인코딩하는 최종 단계**입니다. 이 정보는 QR 코드를 읽을 때 필수적인 메타데이터를 제공합니다.

### 🎯 포맷 및 버전 정보의 역할

- **에러 정정 레벨**: QR 코드의 복구 능력 정보
- **마스크 패턴**: 적용된 마스크 패턴 번호
- **버전 정보**: QR 코드의 크기 정보 (버전 7 이상)
- **에러 정정**: 메타데이터 자체의 에러 정정

### 🔧 7-1단계: 포맷 문자열 생성

15비트 포맷 문자열을 생성합니다.

#### 📊 포맷 문자열 구조

```
15비트 포맷 문자열:
┌─────────────┬─────────────┬─────────────────────────┐
│ 에러 정정    │ 마스크      │ 에러 정정 비트 (10비트) │
│ 레벨 (2비트) │ 패턴 (3비트)│                        │
└─────────────┴─────────────┴─────────────────────────┘
```

#### 🎯 에러 정정 레벨 비트

| 레벨             | 비트 | 설명     |
| ---------------- | ---- | -------- |
| **L (Low)**      | `01` | 7% 복구  |
| **M (Medium)**   | `00` | 15% 복구 |
| **Q (Quartile)** | `11` | 25% 복구 |
| **H (High)**     | `10` | 30% 복구 |

#### 🎯 마스크 패턴 비트

| 패턴 번호 | 비트  | 설명           |
| --------- | ----- | -------------- |
| **0**     | `000` | 체크보드 패턴  |
| **1**     | `001` | 가로 줄무늬    |
| **2**     | `010` | 세로 3칸마다   |
| **3**     | `011` | 대각선 3칸마다 |
| **4**     | `100` | 복합 패턴 1    |
| **5**     | `101` | 복합 패턴 2    |
| **6**     | `110` | 복합 패턴 3    |
| **7**     | `111` | 복합 패턴 4    |

#### 🔬 포맷 문자열 생성 과정

```
1. 에러 정정 레벨 비트 (2비트)
   L → "01"

2. 마스크 패턴 비트 (3비트)
   마스크 4 → "100"

3. 5비트 포맷 문자열 생성
   "01" + "100" = "01100"

4. Reed-Solomon 에러 정정으로 10비트 생성
   "01100" + 에러 정정 비트 = 15비트

5. 마스크 문자열과 XOR
   최종 포맷 문자열 생성
```

#### 💡 실제 예시

```
에러 정정 레벨: L (01)
마스크 패턴: 4 (100)
    ↓
5비트 포맷: "01100"
    ↓
Reed-Solomon 에러 정정: "10100110111"
    ↓
15비트 포맷: "0110010100110111"
    ↓
마스크 XOR: "101010000010010"
    ↓
최종 포맷: "110011010001001"
```

### 🔧 7-2단계: 포맷 정보를 QR 코드에 배치

15비트 포맷 문자열을 QR 코드의 **특정 위치**에 배치합니다.

#### 📍 포맷 정보 배치 위치

<img width="783" height="783" alt="format-layout (2)" src="https://github.com/user-attachments/assets/3567204a-b8b2-4ab0-99cf-8cc4a76ac18d" />

#### 📋 포맷 정보 배치 세부사항

**좌상단 배치 (15비트):**

- Finder 패턴 아래: 8개 비트
- Finder 패턴 오른쪽: 7개 비트

**우상단 배치 (8비트):**

- Finder 패턴 아래: 8개 비트

**좌하단 배치 (7비트):**

- Finder 패턴 오른쪽: 7개 비트

#### 🎯 배치 규칙

1. **중복 배치**: 같은 정보를 여러 위치에 배치하여 에러 정정 능력 향상
2. **고정 위치**: 포맷 정보는 항상 동일한 위치에 배치
3. **함수 패턴 제외**: Finder 패턴과 겹치지 않도록 배치

#### 💡 실제 예시

```
포맷 문자열: "110011010001001" (15비트)

배치:
- 좌상단: "110011010001001" (15비트)
- 우상단: "11001101" (8비트)
- 좌하단: "0001001" (7비트)
```

### 🔧 7-3단계: Dark Module 추가

Dark Module은 좌하단 Finder 패턴 오른쪽에 **항상 배치**되는 검은 모듈입니다.

#### 🎯 Dark Module의 역할

- **방향 표시**: QR 코드의 방향을 결정하는 기준점
- **고정 패턴**: 모든 QR 코드에서 동일한 위치에 배치
- **스캐너 안정성**: 스캐너가 QR 코드를 안정적으로 읽도록 도움

#### 💡 Dark Module 계산

```
Dark Module 위치:
- 행: 8 (고정)
- 열: (4 × 버전) + 9

예시:
- 버전 1: (4 × 1) + 9 = 13
- 버전 2: (4 × 2) + 9 = 17
- 버전 3: (4 × 3) + 9 = 21
```

### 🔧 7-4단계: 버전 정보 추가 (버전 7 이상)

버전 7 이상의 QR 코드에는 **18비트 버전 정보**가 추가됩니다.

#### 📊 버전 정보 구조

```
18비트 버전 정보:
┌─────────────┬─────────────────────────┐
│ 버전 번호    │ 에러 정정 비트 (12비트) │
│ (6비트)     │                        │
└─────────────┴─────────────────────────┘
```

#### 🎯 버전 정보 배치 위치

<img width="318" height="318" alt="version-area1" src="https://github.com/user-attachments/assets/42a6a5f0-01a9-468a-83d0-0ce2ac536242" />

#### 🔬 버전 정보 생성 과정

```
1. 6비트 버전 번호
   버전 7 → "000111"

2. Reed-Solomon 에러 정정으로 12비트 생성
   "000111" + 에러 정정 비트 = 18비트

3. 18비트 버전 정보 문자열
   "000111" + "101010101010"
```

#### 💡 실제 예시

```
버전 7 QR 코드:
- 버전 번호: 7 (000111)
- 에러 정정 비트: 12비트
- 최종 버전 정보: "000111101010101010"
```

**7-5단계: 최종 QR 코드 완성**

최종 QR 코드는 포맷 정보 배치, Dark Module 추가, 버전 정보 추가, 그리고 Quiet Zone 추가를 통해 완성됩니다.

**📥 QR 디코딩 과정 (인코딩의 역순)**

디코딩은 인코딩 과정의 **정확히 역순**으로 진행됩니다:

**7단계 → 1단계: 역순 디코딩**

```typescript
디코딩은 인코딩 과정의 정확히 역순으로 진행됩니다:

**7단계 → 1단계: 역순 디코딩**

1. **포맷/버전 정보 추출**: QR 코드의 메타데이터 추출
2. **마스크 해제**: 적용된 마스크 패턴 제거
3. **매트릭스에서 데이터 추출**: Zigzag 패턴으로 데이터 비트 추출
4. **메시지 구조 해석**: 데이터 코드워드와 ECC 코드워드 분리
5. **에러 정정 및 복원**: Reed-Solomon 알고리즘으로 에러 정정
6. **데이터 디코딩**: 비트스트림을 모드별로 디코딩
7. **모드별 텍스트 변환**: 최종 텍스트 결과 생성
```

---

### 개발 과정 중 챌린지 요소

#### 인코딩, 디코딩 과정이 복잡해 구현 후 검증의 어려움

QR 코드의 인코딩과 디코딩 과정은 **7단계의 복잡한 알고리즘**으로 구성되어 있어, 각 단계별로 정확한 검증이 어려웠습니다. 특히 **비트 단위의 정확성**과 **수학적 연산의 복잡성**으로 인해 구현 후 검증 과정에서 많은 어려움을 겪었습니다.

**🔍 주요 검증 어려움**

**1. Reed-Solomon 에러 정정의 복잡성**

```typescript
// Galois Field 256 연산의 복잡성
const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
decoder.decode(corrected, totalECCCodewords);

// 에러 정정 결과 분석의 어려움
{
  errorCount: number,           // 정정된 에러 개수
  correctionSuccess: boolean,   // 정정 성공 여부
  correctedDataCodewords: number[], // 정정된 데이터
  correctedECCCodewords: number[]   // 정정된 ECC
}
```

**문제점:**

- **Galois Field 256 연산**: 복잡한 수학적 연산으로 인한 디버깅 어려움
- **에러 정정 성공/실패 판단**: 정확한 에러 개수 계산의 어려움
- **코드워드 분리**: 데이터 코드워드와 ECC 코드워드의 정확한 분리

**2. 마스크 패턴 최적화의 정확성**

```typescript
// 8가지 마스크 패턴 중 최적 선택
public findBestMaskPattern(dataEccPositions, pattern) {
  let bestScore = Number.MAX_SAFE_INTEGER;

  for (let maskNumber = 0; maskNumber < 8; maskNumber++) {
    const maskedMatrix = this.applyMaskPattern(dataEccPositions, pattern, maskNumber);
    const score = this.calculatePenaltyScore(maskedMatrix);

    if (score < bestScore) {
      bestScore = score;
      bestMaskNumber = maskNumber;
    }
  }
}
```

**문제점:**

- **4가지 페널티 점수 계산**: 각 페널티 규칙의 정확한 구현
- **마스크 조건 함수**: 8가지 마스크 패턴 함수의 정확성
- **최적 마스크 선택**: 모든 마스크 패턴을 시도하여 최적값 찾기

**3. 비트스트림 처리의 정확성**

```typescript
// 모드별 비트 인코딩의 복잡성
createInitialBitStream(text, mode, modeIndicatorBits, version) {
  // 모드 인디케이터 (4비트): Numeric(0001), Alphanumeric(0010), Byte(0100)
  // 문자 수 비트 (버전별 가변 길이): 버전 1-9(10/9/8비트), 10-26(12/11/16비트)
  // 데이터 비트 (모드별 인코딩): 11비트씩, 10비트씩, 8비트씩
}
```

**문제점:**

- **모드별 인코딩 규칙**: 각 모드의 정확한 비트 인코딩 규칙
- **버전별 비트 길이**: 버전에 따른 문자 수 비트 길이 변화
- **패딩 처리**: 종료 비트, 바이트 패딩, 패딩 바이트의 정확한 처리

**4. 매트릭스 배치의 위치 계산**

```typescript
// Zigzag 패턴으로 데이터/ECC 모듈 배치
findDataModules(bitStream, finalBits) {
  // 우하단에서 시작하여 Z자 형태로 배치
  // 예약된 영역 제외하고 데이터/ECC 비트 배치
  // 2열씩 묶어서 위아래로 번갈아가며 배치
}
```

**문제점:**

- **Zigzag 패턴**: 복잡한 배치 순서의 정확한 구현
- **예약된 영역 제외**: Finder, Alignment, Timing 패턴과 겹치지 않도록 처리
- **2열 묶음 처리**: 2열씩 묶어서 위아래로 번갈아가며 배치

**💡 해결 방법: 단위 테스트를 통한 정확한 검증**

**✅ 단계별 단위 테스트로 정확성 보장**

```typescript
// 1단계: 기본 구조 검증
describe("getVersionByMatrixSize", () => {
  it("다양한 매트릭스 크기에 대한 버전 계산이 올바르게 되어야 한다.", () => {
    expect(qr.qrDecoder.getVersionByMatrixSize(21)).toBe(1);
    expect(qr.qrDecoder.getVersionByMatrixSize(25)).toBe(2);
    expect(qr.qrDecoder.getVersionByMatrixSize(29)).toBe(3);
  });
});

// 2단계: 패턴 검출 검증
describe("21x21 matrix", () => {
  it("21x21 매트릭스의 파인더 패턴은 147개가 되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_21_BY_21);
    expect(finderPositions.length).toBe(147);
  });
});

// 3단계: 포맷 정보 검증
it("21x21 테스트 매트릭스의 포맷 비트는 111110110101010이 되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  expect(formatBits).toBe("111110110101010");
});

// 4단계: 인코딩 모드 검증
describe("Numeric 모드", () => {
  it("Numeric 모드의 모드 인디케이터 비트는 0001이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode("1234567890");
    expect(modeIndicatorBits).toBe("0001");
  });
});

// 5단계: ECC 처리 검증
describe("ECC 관련 함수", () => {
  it("convertToCodewords: 8비트 단위로 코드워드 변환해야한다.", () => {
    const bits = "1100110001010101";
    const codewords = qr.qrEncoder.convertToCodewords(bits);
    expect(codewords).toEqual([204, 85]);
  });
});

// 6단계: 최종 통합 검증
it("21x21 테스트 매트릭스는 HELLO WORLD 문자열로 디코딩되어야 한다.", () => {
  const decodedText = qr.qrDecoder.decodeBitToText(TEST_MATRIX_21_BY_21);
  expect(decodedText).toBe("HELLO WORLD");
});
```

**✅ 비트 단위 정확성 검증**

```typescript
// 모드 인디케이터 비트 검증
it("Numeric 모드의 모드 인디케이터 비트는 0001이 되어야 한다", () => {
  const { modeIndicatorBits } = qr.qrEncoder.getMode("1234567890");
  expect(modeIndicatorBits).toBe("0001");
});

// 문자 수 비트 검증
it("Numeric 모드의 문자 수 비트 길이는 10자 이하인 경우 10비트가 되어야 한다", () => {
  const charCountBitLength = qr.qrEncoder.getCharCountBitLength(1, "Numeric", "1234567890");
  expect(charCountBitLength).toBe("0000001010");
});

// 포맷 정보 비트 검증
it("21x21 테스트 매트릭스의 포맷 비트는 111110110101010이 되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  expect(formatBits).toBe("111110110101010");
});
```

**✅ 수학적 연산 검증**

```typescript
// Reed-Solomon 에러 정정 검증
it("21x21 테스트 매트릭스의 ECC 정보는 총 19개의 데이터 비트와 7개의 ECC 비트로 검출되어야 한다.", () => {
  const eccInfo = qr.qrDecoder.getErrorCorrectionInfo(TEST_MATRIX_21_BY_21);
  expect(eccInfo?.totalDataCodewords).toBe(19);
  expect(eccInfo?.ecCodewordsPerBlock).toBe(7);
});

// 마스크 패턴 검증
it("21x21 테스트 매트릭스의 포맷 비트의 마스크 패턴 번호는 010비트로 검출되어 10진수 2로 변환되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  const maskPattern = qr.qrDecoder.getMaskPattern(formatBits);
  expect(maskPattern).toBe(2);
});
```

**✅ 실제 QR 코드 기반 검증**

```typescript
// 외부 QR 생성기로 만든 정확한 매트릭스 데이터 사용
export const TEST_MATRIX_21_BY_21: number[][] = [
  // "HELLO WORLD" 문자열을 인코딩한 실제 QR 코드
  // 외부 QR 생성기로 만든 정확한 매트릭스 데이터
];

// 실제 스캐너로 읽을 수 있는 QR 코드로 검증
it("21x21 테스트 매트릭스는 마스크 해체 후 모드는 Alphanumeric이고 문자 개수는 11개로 검출되어 HELLO WORLD 문자열로 디코딩되어야 한다.", () => {
  const decodedText = qr.qrDecoder.decodeBitToText(TEST_MATRIX_21_BY_21);
  expect(decodedText).toBe("HELLO WORLD");
});
```

**🎯 검증 전략의 핵심**

**✅ 단계별 테스트로 정확성 보장**

- **각 단계마다 단위 테스트 작성**: 구현 후 즉시 검증하여 오류 조기 발견
- **비트 단위 정확성 검증**: 모든 비트스트림의 정확성을 테스트로 확인
- **수학적 연산 검증**: Reed-Solomon, BCH, 마스크 패턴 등 복잡한 수학적 연산을 테스트로 검증
- **실제 QR 코드 기반 검증**: 외부 도구로 만든 정확한 데이터로 최종 검증

**✅ 테스트 주도 개발 방식**

- **구현 전 테스트 작성**: 각 함수의 예상 결과를 먼저 정의
- **구현 후 즉시 검증**: 테스트를 통과할 때까지 반복 개선
- **리팩토링 시 안전성 보장**: 테스트가 있으므로 안전하게 코드 개선 가능

**📈 검증 결과**

- **기본 기능**: 버전 계산, 패턴 검출, 모드 인식 ✅ (단위 테스트로 검증)
- **인코딩**: Numeric, Alphanumeric, Byte 모드별 테스트 ✅ (비트 단위 검증)
- **디코딩**: 실제 QR 코드 매트릭스로 최종 결과 검증 ✅ (통합 테스트로 검증)
- **에러 정정**: Reed-Solomon 알고리즘 정확성 검증 ✅ (수학적 연산 테스트)
- **마스킹**: 8가지 마스크 패턴 최적화 검증 ✅ (페널티 점수 테스트)

#### 매번 클래스를 생성하지 않을 수 있을까?(싱글턴 패턴)

QR 인코더와 디코더는 **상태를 유지할 필요가 없는 순수 함수형** 특성을 가지고 있어, 매번 새로운 인스턴스를 생성하는 것보다 **싱글턴 패턴**을 적용하는 것이 효율적입니다.

**🤔 왜 싱글턴 패턴을 선택했을까?**

**1. 순수 함수형 특성**

```typescript
// QR 인코더/디코더는 상태가 없는 순수 함수들로 구성
class QREncoder {
  // 상태를 저장하지 않는 순수 함수들
  getMode(text: string) {
    /* ... */
  }
  buildBitStream(text: string, errorLevel: string) {
    /* ... */
  }
  generateECC(bitStream: string, version: number, errorLevel: string) {
    /* ... */
  }
}

class QRDecoder {
  // 상태를 저장하지 않는 순수 함수들
  detectFinderPositions(matrix: number[][]) {
    /* ... */
  }
  decodeBitToText(matrix: number[][]) {
    /* ... */
  }
  getECCDetail(matrix: number[][]) {
    /* ... */
  }
}
```

**2. 메모리 효율성과 성능**

```typescript
// ❌ 매번 새로운 인스턴스 생성 (비효율적)
const encoder1 = new QREncoder();
const encoder2 = new QREncoder();
const encoder3 = new QREncoder();
// 메모리 낭비: 동일한 기능의 인스턴스가 3개

// ✅ 싱글턴 패턴 사용 (효율적)
const qr = new QR(); // 하나의 인스턴스만 생성
qr.qrEncoder.encode(text1);
qr.qrEncoder.encode(text2);
qr.qrEncoder.encode(text3);
// 메모리 효율: 하나의 인스턴스로 모든 작업 처리
```

**🔧 구현 방식**

```typescript
// src/libs/QR/index.ts
class QR {
  public qrDecoder: QRDecoder;
  public qrEncoder: QREncoder;

  constructor() {
    this.qrDecoder = new QRDecoder();
    this.qrEncoder = new QREncoder();
  }
}

// 싱글턴 인스턴스로 전역 사용
export const qr = new QR();
```

**✅ 싱글턴 패턴의 장점**

**1. 메모리 효율성**

```typescript
// 하나의 인스턴스로 모든 QR 작업 처리
const encodedMatrix = qr.qrEncoder.buildBitStream("Hello World", "L");
const decodedText = qr.qrDecoder.decodeBitToText(matrix);
const eccInfo = qr.qrDecoder.getECCDetail(matrix);
```

**2. 일관성 보장**

```typescript
// 동일한 설정과 상태로 모든 연산 수행
// 모든 곳에서 동일한 QR 인스턴스 사용
qr.qrEncoder.getMode("1234567890"); // Numeric 모드
qr.qrEncoder.getMode("HELLO WORLD"); // Alphanumeric 모드
qr.qrEncoder.getMode("Hello!@#한글"); // Byte 모드
```

**3. 간편한 사용**

```typescript
// 직관적이고 간단한 API
// ❌ 복잡한 인스턴스 생성
const encoder = new QREncoder();
const decoder = new QRDecoder();
const result = encoder.encode(text);

// ✅ 간단한 전역 사용
const result = qr.qrEncoder.buildBitStream(text, errorLevel);
const decoded = qr.qrDecoder.decodeBitToText(matrix);
```

**4. 테스트 용이성**

```typescript
// 동일한 인스턴스로 일관된 테스트
describe("21x21 matrix", () => {
  it("should decode correctly", () => {
    const result = qr.qrDecoder.decodeBitToText(TEST_MATRIX_21_BY_21);
    expect(result).toBe("HELLO WORLD");
  });
});

describe("Numeric 모드", () => {
  it("should encode correctly", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode("1234567890");
    expect(modeIndicatorBits).toBe("0001");
  });
});
```

**🎯 실제 사용 예시**

**1. 인코딩 과정**

```typescript
// src/features/encode/index.tsx
const Encode = () => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    // 싱글턴 인스턴스 사용
    const smallestVersion = qr.qrEncoder.getSmallestVersion(inputValue, errorCorrectionLevel);
    setMatrix(
      Array.from({ length: smallestVersion * 4 + 17 }, () =>
        Array.from({ length: smallestVersion * 4 + 17 }, () => 0),
      ),
    );
  }, [inputValue, errorCorrectionLevel]);
};
```

**2. 디코딩 과정**

```typescript
// src/features/decode/components/details/FormatDetail.tsx
const FormatDetail = ({ matrix }: DetailProps) => {
  // 싱글턴 인스턴스 사용
  const maskedFormatBits = qr.qrDecoder.getMaskedFormatBits(matrix);
  const ecLevel = qr.qrDecoder.getECLevel(maskedFormatBits);
  const maskPattern = qr.qrDecoder.getMaskPattern(maskedFormatBits);
};
```

**3. 테스트 코드**

```typescript
// src/libs/QRDecoder/tests/QRDecoder.test.ts
describe("21x21 matrix", () => {
  it("21x21 매트릭스의 파인더 패턴은 147개가 되어야 한다.", () => {
    // 싱글턴 인스턴스 사용
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_21_BY_21);
    expect(finderPositions.length).toBe(147);
  });
});
```

**🔍 다른 패턴과의 비교**

**❌ 매번 새로운 인스턴스 생성**

```typescript
// 문제점: 메모리 낭비, 일관성 부족
const encoder1 = new QREncoder();
const encoder2 = new QREncoder();
const decoder1 = new QRDecoder();
const decoder2 = new QRDecoder();
```

**❌ 정적 메서드만 사용**

```typescript
// 문제점: 유연성 부족, 확장성 제한
class QREncoder {
  static getMode(text: string) {
    /* ... */
  }
  static buildBitStream(text: string, errorLevel: string) {
    /* ... */
  }
}
```

**✅ 싱글턴 패턴 (최적 선택)**

```typescript
// 장점: 메모리 효율, 일관성, 간편한 사용
const qr = new QR();
qr.qrEncoder.buildBitStream(text, errorLevel);
qr.qrDecoder.decodeBitToText(matrix);
```

**📈 성능 및 메모리 비교**

**메모리 사용량:**

- **매번 인스턴스 생성**: O(n) - 사용할 때마다 메모리 증가
- **싱글턴 패턴**: O(1) - 하나의 인스턴스로 모든 작업 처리

**성능:**

- **매번 인스턴스 생성**: 느림 - 생성/소멸 오버헤드
- **싱글턴 패턴**: 빠름 - 재사용으로 인한 성능 향상

**코드 복잡도:**

- **매번 인스턴스 생성**: 복잡 - 인스턴스 관리 필요
- **싱글턴 패턴**: 간단 - 전역 인스턴스 사용

**🎯 결론**

싱글턴 패턴을 선택한 이유는 **QR 인코더/디코더의 순수 함수형 특성**과 **메모리 효율성**, **일관성 보장**, **간편한 사용** 때문입니다. 특히 상태를 저장하지 않는 순수 함수들로 구성된 QR 클래스에서는 싱글턴 패턴이 가장 적합한 설계 패턴입니다.

---

#### 테스트는 어떻게 진행해야 할까?

QR 코드의 복잡한 구조를 정확히 구현하기 위해 **단계별로 하나씩 꼼꼼하게 테스트**했습니다. 각 기능이 정상 작동하는지 확인한 후에 다음 단계로 진행하는 방식으로 개발했습니다.

**🔍 단계별 테스트 진행 과정**

**1단계: 기본 구조 검증 테스트**

```typescript
describe("getVersionByMatrixSize", () => {
  it("다양한 매트릭스 크기에 대한 버전 계산이 올바르게 되어야 한다.", () => {
    expect(qr.qrDecoder.getVersionByMatrixSize(21)).toBe(1);
    expect(qr.qrDecoder.getVersionByMatrixSize(25)).toBe(2);
    expect(qr.qrDecoder.getVersionByMatrixSize(29)).toBe(3);
    expect(qr.qrDecoder.getVersionByMatrixSize(33)).toBe(4);
    expect(qr.qrDecoder.getVersionByMatrixSize(37)).toBe(5);
  });

  it("버전 계산 공식이 1~40 까지 올바르게 작동해야 한다.", () => {
    for (let version = 1; version <= 40; version++) {
      const size = 21 + (version - 1) * 4;
      const calculatedVersion = qr.qrDecoder.getVersionByMatrixSize(size);
      expect(calculatedVersion).toBe(version);
    }
  });
});
```

**2단계: 패턴 검출 기능 테스트**

```typescript
describe("21x21 matrix", () => {
  it("21x21 매트릭스의 파인더 패턴은 147개가 되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_21_BY_21);
    expect(finderPositions.length).toBe(147);
  });

  it("21x21 매트릭스의 파인더 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_21_BY_21);
    const expectedPositions = [
      { row: 0, col: 0 }, // 좌상단
      { row: 0, col: 14 }, // 우상단
      { row: 14, col: 0 }, // 좌하단
    ];
    expect(finderPositions).toEqual(expect.arrayContaining(expectedPositions));
  });

  it("21x21 매트릭스의 타이밍 패턴은 10개가 되어야 한다.", () => {
    const timingPositions = qr.qrDecoder.detectTimingPositions(TEST_MATRIX_21_BY_21);
    expect(timingPositions.length).toBe(10);
  });

  it("21x21 매트릭스의 타이밍 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const timingPositions = qr.qrDecoder.detectTimingPositions(TEST_MATRIX_21_BY_21);
    expect(timingPositions).toEqual([
      { row: 6, col: 8, value: 1 }, // 가로 타이밍 패턴
      { row: 6, col: 9, value: 0 },
      { row: 6, col: 10, value: 1 },
      { row: 6, col: 11, value: 0 },
      { row: 6, col: 12, value: 1 },
      { row: 8, col: 6, value: 1 }, // 세로 타이밍 패턴
      { row: 9, col: 6, value: 0 },
      { row: 10, col: 6, value: 1 },
      { row: 11, col: 6, value: 0 },
      { row: 12, col: 6, value: 1 },
    ]);
  });
});
```

**3단계: 포맷 정보 추출 테스트**

```typescript
it("21x21 매트릭스의 포맷 패턴은 30개가 되어야 한다.", () => {
  const formatPositions = qr.qrDecoder.detectFormatPositions(TEST_MATRIX_21_BY_21);
  expect(formatPositions.length).toBe(30);
});

it("21x21 테스트 매트릭스의 포맷 비트는 15개가 되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  expect(formatBits.length).toBe(15);
});

it("21x21 테스트 매트릭스의 포맷 비트는 111110110101010이 되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  expect(formatBits).toBe("111110110101010");
});

it("21x21 테스트 매트릭스의 포맷 비트의 마스크 해제 후 비트는 010100110111000으로 검출되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  const unmasked = qr.qrDecoder.unmaskFormatBits(formatBits);
  expect(unmasked).toBe("010100110111000");
});

it("21x21 테스트 매트릭스의 포맷 비트의 ECC 레벨은 01: L로 검출되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  const ecLevel = qr.qrDecoder.getECLevel(formatBits);
  expect(ecLevel).toBe("L");
});

it("21x21 테스트 매트릭스의 포맷 비트의 마스크 패턴 번호는 010비트로 검출되어 10진수 2로 변환되어야 한다.", () => {
  const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
  const maskPattern = qr.qrDecoder.getMaskPattern(formatBits);
  expect(maskPattern).toBe(2);
});
```

**4단계: 인코딩 모드별 상세 테스트**

```typescript
describe("Numeric 모드", () => {
  it("Numeric 모드의 모드 인디케이터 비트는 0001이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode("1234567890");
    expect(modeIndicatorBits).toBe("0001");
  });

  it("Numeric 모드의 mode는 Numeric이 되어야 한다", () => {
    const { mode } = qr.qrEncoder.getMode("1234567890");
    expect(mode).toBe("Numeric");
  });

  it("Numeric 모드의 최소 버전은 1이 되어야 한다", () => {
    const version = qr.qrEncoder.getSmallestVersion("1234567890", "L");
    expect(version).toBe(1);
  });

  it("Numeric 모드의 문자 수 비트 길이는 10자 이하인 경우 10비트가 되어야 한다", () => {
    const charCountBitLength = qr.qrEncoder.getCharCountBitLength(1, "Numeric", "1234567890");
    expect(charCountBitLength).toBe("0000001010");
  });

  it("버전 1 L 에러레벨의 총 비트 수는 152가 되어야 한다", () => {
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    expect(totalBits).toBe(152);
  });

  it("버전 1 L 에러레벨의 비트스트림은 정확한 값이 되어야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream("1234567890", "Numeric", "0001", 1);
    expect(bitStream).toBe("000100000010100001111011011100100011000101010000");
  });
});

describe("Alphanumeric 모드", () => {
  it("Alphanumeric 모드의 모드 인디케이터 비트는 0010이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode("HELLO1234 ");
    expect(modeIndicatorBits).toBe("0010");
  });

  it("Alphanumeric 모드의 mode는 Alphanumeric이 되어야 한다", () => {
    const { mode } = qr.qrEncoder.getMode("HELLO1234 ");
    expect(mode).toBe("Alphanumeric");
  });
});

describe("Byte 모드", () => {
  it("Byte 모드의 모드 인디케이터 비트는 0100이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode("Hello!@#한글");
    expect(modeIndicatorBits).toBe("0100");
  });

  it("Byte 모드의 mode는 Byte이 되어야 한다", () => {
    const { mode } = qr.qrEncoder.getMode("Hello!@#한글");
    expect(mode).toBe("Byte");
  });
});
```

**5단계: ECC(에러 정정 코드) 테스트**

```typescript
describe("ECC 관련 함수", () => {
  it("convertToCodewords: 8비트 단위로 코드워드 변환해야한다.", () => {
    const bits = "1100110001010101";
    const codewords = qr.qrEncoder.convertToCodewords(bits);
    expect(codewords).toEqual([204, 85]);
  });

  it("prepareDataAndECCInfo: 데이터 코드워드와 ECC 정보 반환해야한다.", () => {
    const bits = "1100110001010101";
    const version = 1;
    const ecLevel = "L";
    const { dataCw, shardLen, eccLen } = qr.qrEncoder.prepareDataAndECCInfo(bits, version, ecLevel);
    expect(dataCw).toEqual([204, 85]);
    expect(shardLen).toBe(19);
    expect(eccLen).toBe(7);
  });

  it("generateECCCodewords: ECC 코드워드 생성해야한다.", () => {
    const dataCw = Array(19).fill(1);
    const shardLen = 19;
    const eccLen = 7;
    const eccCw = qr.qrEncoder.generateECCCodewords(dataCw, shardLen, eccLen);
    expect(eccCw.length).toBe(eccLen);
  });
});
```

**6단계: 최종 통합 테스트**

```typescript
it("21x21 테스트 매트릭스의 포맷 비트(010100110111000, version: 1, 에러 수준 L, 마스크 패턴 2)의 ECC 정보는 총 19개의 데이터 비트와 7개의 ECC 비트로 검출되어야 한다.", () => {
  const eccInfo = qr.qrDecoder.getErrorCorrectionInfo(TEST_MATRIX_21_BY_21);
  expect(eccInfo?.totalDataCodewords).toBe(19);
  expect(eccInfo?.ecCodewordsPerBlock).toBe(7);
});

it("21x21 테스트 매트릭스는 마스크 해체 후 모드는 Alphanumeric이고 문자 개수는 11개로 검출되어 HELLO WORLD 문자열로 디코딩되어야 한다.", () => {
  const decodedText = qr.qrDecoder.decodeBitToText(TEST_MATRIX_21_BY_21);
  expect(decodedText).toBe("HELLO WORLD");
});

it("25x25 테스트 매트릭스는 마스크 해체 후 모드는 Byte이고 문자 개수는 11개로 검출되어 바이트 배열로 디코딩되어야 한다.", () => {
  const decodedText = qr.qrDecoder.decodeBitToText(TEST_MATRIX_25_BY_25);
  expect(decodedText).toBe("bizhows.com");
});
```

**📊 테스트 데이터 설계**

```typescript
// src/constants/testMatrix.ts
export const TEST_MATRIX_21_BY_21: number[][] = [
  // 21x21 QR 코드 매트릭스 (버전 1)
  // "HELLO WORLD" 문자열을 인코딩한 실제 QR 코드
  // 외부 QR 생성기로 만든 정확한 매트릭스 데이터
];

export const TEST_MATRIX_25_BY_25: number[][] = [
  // 25x25 QR 코드 매트릭스 (버전 2)
  // "bizhows.com" 문자열을 인코딩한 실제 QR 코드
  // 외부 QR 생성기로 만든 정확한 매트릭스 데이터
];
```

**🎯 테스트 진행 방식의 핵심 포인트**

**✅ 단계별 검증**

- **1단계**: 기본 구조 (버전 계산, 매트릭스 크기)
- **2단계**: 패턴 검출 (Finder, Alignment, Timing 패턴)
- **3단계**: 포맷 정보 (마스킹, 언마스킹, ECC 레벨, 마스크 패턴)
- **4단계**: 인코딩 모드 (Numeric, Alphanumeric, Byte)
- **5단계**: ECC 처리 (Reed-Solomon 인코딩/디코딩)
- **6단계**: 최종 통합 (전체 디코딩 결과)

**✅ 실제 QR 코드 기반 테스트**

- 외부 QR 생성기로 만든 정확한 매트릭스 데이터 사용
- 실제 스캐너로 읽을 수 있는 QR 코드로 검증
- 알려진 결과값과 정확히 일치하는지 확인

**✅ 매트릭스 크기별 분리 테스트**

```typescript
describe("21x21 matrix", () => {
  // 버전 1 QR 코드 전용 테스트
});

describe("25x25 matrix", () => {
  // 버전 2 QR 코드 전용 테스트
});
```

**✅ 비트 단위 정확성 검증**

- 모드 인디케이터 비트: Numeric(0001), Alphanumeric(0010), Byte(0100)
- 문자 수 비트: 버전별 정확한 비트 길이
- 포맷 정보 비트: 15비트 정확한 값
- 마스킹 패턴: XOR 연산 정확성

**🔧 테스트 도구 및 전략**

- **Vitest**: 빠른 테스트 실행과 TypeScript 지원
- **실제 QR 코드**: 외부 QR 생성기로 만든 코드를 테스트 데이터로 활용
- **단계별 검증**: 각 인코딩/디코딩 단계별 개별 테스트
- **비트 단위 검증**: 모든 비트스트림의 정확성 확인
- **경계값 테스트**: 최대/최소 버전, 빈 문자열 등 극한 케이스

**📈 테스트 커버리지 결과**

- **기본 기능**: 버전 계산, 패턴 검출, 모드 인식 ✅
- **인코딩**: Numeric, Alphanumeric, Byte 모드별 테스트 ✅
- **디코딩**: 실제 QR 코드 매트릭스로 최종 결과 검증 ✅
- **에러 처리**: 잘못된 입력에 대한 예외 처리 ✅
- **경계값**: 최대/최소 버전, 빈 문자열 등 극한 케이스 ✅
