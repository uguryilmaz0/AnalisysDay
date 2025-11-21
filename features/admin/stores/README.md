# Zustand State Management

Bu klasör, Zustand ile global state yönetimini içerir.

## 📁 Yapı

```
features/admin/stores/
├── adminStore.ts           # Admin state management
└── index.ts                # Export dosyası
```

## 🎯 Admin Store

### State

```typescript
{
  // Data
  analyses: DailyAnalysis[]
  users: User[]
  usersWithAuthData: Array<User & { emailVerified: boolean }>

  // Loading states
  loading: boolean
  analysesLoading: boolean
  usersLoading: boolean

  // Error state
  error: Error | null
}
```

### Actions

#### Data Loading

- `loadAllData()` - Tüm verileri paralel yükler
- `loadAnalyses()` - Sadece analizleri yükler
- `loadUsers()` - Sadece kullanıcıları yükler

#### Analysis Actions

- `addAnalysis(analysis)` - Optimistic update ile analiz ekler
- `removeAnalysis(id)` - Optimistic update + rollback ile siler

#### User Actions

- `updateUser(uid, updates)` - Optimistic update ile günceller
- `removeUser(uid)` - Optimistic update + rollback ile siler

#### Utility

- `reset()` - Store'u initial state'e döndürür

## 📖 Kullanım Örnekleri

### Component'te State Okuma

```typescript
import { useAdminStore } from "@/features/admin/stores";

function MyComponent() {
  // Tek bir değer seç (re-render optimization)
  const analyses = useAdminStore((state) => state.analyses);
  const loading = useAdminStore((state) => state.loading);

  // Veya tüm state
  const { users, loadAllData } = useAdminStore();
}
```

### Data Loading

```typescript
function AdminPage() {
  const loadAllData = useAdminStore((state) => state.loadAllData);

  useEffect(() => {
    loadAllData(); // Paralel veri yükleme
  }, []);
}
```

### Optimistic Updates

```typescript
function DeleteButton({ analysisId }: Props) {
  const removeAnalysis = useAdminStore((state) => state.removeAnalysis);

  const handleDelete = async () => {
    try {
      // Optimistic update - hemen UI'dan kaldırır
      await removeAnalysis(analysisId);
      showToast("Silindi!", "success");
    } catch (error) {
      // Hata durumunda otomatik rollback
      showToast("Hata!", "error");
    }
  };
}
```

### Selective State Subscription

```typescript
// ❌ Yanlış - her state değişiminde re-render
const store = useAdminStore();

// ✅ Doğru - sadece analyses değişince re-render
const analyses = useAdminStore((state) => state.analyses);

// ✅ Doğru - sadece loading değişince re-render
const loading = useAdminStore((state) => state.loading);
```

## 🚀 Avantajlar

### 1. Prop Drilling Yok

```typescript
// Öncesi
<Parent>
  <Child data={data} onUpdate={onUpdate} />
    <GrandChild data={data} onUpdate={onUpdate} />
</Parent>

// Sonrası
<Parent>
  <Child />
    <GrandChild /> // Direkt store'dan okur
</Parent>
```

### 2. Optimistic Updates

```typescript
// UI anında güncellenir, hata durumunda rollback
await removeAnalysis(id);
// Başarısız olursa otomatik geri alınır
```

### 3. Selective Re-renders

```typescript
// Sadece analyses değiştiğinde re-render
const analyses = useAdminStore((state) => state.analyses);
// users değişse de bu component re-render olmaz
```

### 4. Global State Access

```typescript
// Herhangi bir component'ten erişilebilir
function AnyComponent() {
  const analyses = useAdminStore((state) => state.analyses);
}
```

## 🔄 Veri Akışı

```
Component
   ↓ (action çağrısı)
Store
   ↓ (service call)
Service Layer
   ↓ (API call)
Database
   ↓ (response)
Store (state güncelleme)
   ↓ (selector)
Component (re-render)
```

## 📊 Performans Optimizasyonları

### 1. Selector Pattern

```typescript
// Sadece ihtiyacınız olan state'i seçin
const analyses = useAdminStore((state) => state.analyses);
```

### 2. Shallow Comparison

```typescript
import { shallow } from "zustand/shallow";

const { analyses, users } = useAdminStore(
  (state) => ({ analyses: state.analyses, users: state.users }),
  shallow
);
```

### 3. Computed Values

```typescript
const premiumCount = useAdminStore(
  (state) => state.users.filter((u) => u.isPaid).length
);
```

## 🧪 Testing

```typescript
import { useAdminStore } from "@/features/admin/stores";

beforeEach(() => {
  useAdminStore.getState().reset(); // Her testten önce reset
});

test("should add analysis", () => {
  const { addAnalysis, analyses } = useAdminStore.getState();

  addAnalysis(mockAnalysis);

  expect(analyses).toHaveLength(1);
});
```

## 🔧 Store Genişletme

Yeni action eklemek için:

```typescript
export const useAdminStore = create<AdminState>((set, get) => ({
  // ... existing state

  // Yeni action
  myNewAction: async (param) => {
    const { analyses } = get(); // Mevcut state'e eriş

    try {
      // İşlem yap
      const result = await myService.doSomething(param);

      // State güncelle
      set({ analyses: [...analyses, result] });
    } catch (error) {
      set({ error });
    }
  },
}));
```

## 📝 Best Practices

1. **Selector kullanın** - Gereksiz re-render'ları önleyin
2. **Optimistic updates** - UX için hemen güncelleme yapın
3. **Error handling** - Rollback mekanizması ekleyin
4. **Loading states** - Her action için loading state yönetin
5. **Reset function** - Test ve cleanup için reset ekleyin

## 🎯 Öncesi vs Sonrası

### Öncesi (Props)

```typescript
// AdminPage.tsx
<UserManagementTab
  users={users}
  usersWithAuthData={usersWithAuthData}
  currentUserId={user?.uid}
  onUpdateSuccess={loadData}
/>

// 4 prop geçirmek zorunda
// Her güncelleme loadData çağrısı
// Prop drilling
```

### Sonrası (Zustand)

```typescript
// AdminPage.tsx
<UserManagementTab currentUserId={user?.uid} />;

// Sadece 1 prop
// Store otomatik güncellenir
// Prop drilling yok

// UserManagementTab.tsx
const users = useAdminStore((state) => state.users);
const loadUsers = useAdminStore((state) => state.loadUsers);
// Direkt store'dan okur
```

## 🌟 Kazanımlar

- ✅ **-75% Props** - 4 prop → 1 prop
- ✅ **Optimistic Updates** - Anında UI güncellemesi
- ✅ **Rollback Support** - Hata durumunda geri alma
- ✅ **Selective Re-renders** - Performance artışı
- ✅ **Global State** - Her yerden erişim
- ✅ **Type Safety** - TypeScript desteği
- ✅ **DevTools** - Zustand DevTools ile debug
