# Vue и TypeScript

---

## Ссылки

- TypeScript: https://www.typescriptlang.org/
- Отличный учебник по TypeScript: https://basarat.gitbook.io/typescript
  - Перевод на русский: https://github.com/etroynov/typescript-book/blob/master/SUMMARY.md
- Документация - Использование Vue с
  TypeScript: https://vuejs.org/guide/typescript/overview.html ([RU](https://ru.vuejs.org/guide/typescript/overview.html))
- Документация - TypeScript с Composition
  API: https://vuejs.org/guide/typescript/composition-api.html ([RU](https://ru.vuejs.org/guide/typescript/composition-api.html))
- Типизация слотов:
  - Документация - `defineSlots`: https://vuejs.org/api/sfc-script-setup.html#defineslots ([RU](https://ru.vuejs.org/api/sfc-script-setup.html#defineslots))
  - Документация - опция `slots` и тип `SlotsType`: https://vuejs.org/api/options-rendering.html#slots ([RU](https://ru.vuejs.org/api/options-rendering.html#slots)) 
- TSC с поддержкой SFC (`.vue` файлов): `vue-tsc`: https://github.com/vuejs/language-tools/tree/master/packages/tsc
- Утилиты `vue-component-type-helpers`: https://www.npmjs.com/package/vue-component-type-helpers
  - Исходники: https://github.com/vuejs/language-tools/blob/master/packages/component-type-helpers/index.ts

---

## 1. О TypeScript

### 1.1. Что такое TypeScript?

**TypeScript — это "JavaScript с типами".**

Классический TypeScript - строго-типизированный язык программирования, построенный поверх JavaScript, и добавляющий в
него:

- Синтаксис для статической типизации
- Другие дополнительные синтаксические конструкции

```ts
// Новая синтаксическая конструкция - при компиляции превратится в JavaScript объект
enum Role {
  Admin = 'Admin',
  User = 'User',
}

// Новая синтаксическая конструкция для описания типа - она будет вырезана при компиляции
type User = {
  id: number,
  name: string,
  role: Role,
}

// Следующие синтаксические конструкции - почти обычный JavaScript, но с указанием типов переменных
// При компиляции эти типы будут вырезаны 
function greet(user: User) {
  return `Hello, ${user.name}!`
}

const alice: User = { id: 1, name: 'Alice', role: Role.Admin }
greet(alice)

// Ошибка от TS:
// Argument of type '{ id: number; fullName: string; }' is not assignable to parameter of type 'User'.
//   Type '{ id: number; fullName: string; }' is missing the following properties from type 'User': name, role
const bob = { id: 2, fullName: 'Bob Smith' }
greet(bob)
```

Этот код компилируется в следующий

```js
var Role;
(function (Role) {
  Role["Admin"] = "Admin";
  Role["User"] = "User";
})(Role || (Role = {}));

function greet (user) {
  return `Hello, ${user.name}!`;
}

const alice = {id: 1, name: 'Bob', role: Role.Admin};
greet(alice);

const bob = {id: 2, fullName: 'Alice Smith'};
greet(bob);
```

Изучение TypeScript:
- Официальная документация TypeScript: https://www.typescriptlang.org/
- Отличный учебник по TypeScript: https://basarat.gitbook.io/typescript
  - На русском: https://github.com/etroynov/typescript-book/blob/master/SUMMARY.md

```smart header="TS - от языка программирования к статическому анализатору"
Исторически TypeScript использовался как язык программирования. Он вносил множество новых синтаксических
конструкций, и использовался как компилятор. Со временем JavaScript сильно развился, и надобность в дополнительных
конструкциях TypeScript уменьшилась. Например, `class` есть в JavaScript с ES2015. Другие возможности стали 
конфликтовать с современным стандартом ECMAScript, например, декораторы.

В современном фронтенде TypeScript всё больше используется не как язык программирования, а как статический анализатор
кода, подобно ESLint. Он только проверяет код на наличие ошибок, а TypeScript код просто вырезается при компиляции. Так
от TypeScript используют только описание типов, но в остальном весь код - это JavaScript.
```

### 1.2. Зачем нужен TypeScript?

TypeScript используются для:

- Защиты от ошибок, например:
  - Обращение к полю объекта, который может быть `null`
  - Использование несуществующей полей и методов объектов
  - И др.
- Документирования кода и подсказок в IDE
- Реализации инструментов, которые требуют выводящуюся из типов информацию, например, инструменты генерации
  документации

Обязательно ли использовать TypeScript? Нет.
- Он не даёт гарантии отсутствия ошибок
- Для документации можно использовать JSDoc, хотя это менее удобный инструмент
- Нередко TypeScript требует дополнительного времени при написании кода для корректного описания типов, особенно когда
  источник проблемы в ограничениях или багах самого TypeScript

Разные команды принимают разное решение об использовании TypeScript. Но с каждым годом всё большая доля проектов
использует TypeScript, и всё чаще в новых проектах TypeScript используется по умолчанию.

## 2. TS в Vue вне SFC

### 2.1. Vue API

Vue написан на TypeScript и хорошо покрыт типизацией. В большинстве случаев он корректно выводит тип, или позволяет его
удобно указать через generic. Все необходимые при работе типы экспортируются из `vue`.

```ts
import type { Ref } from 'vue'
import { ref } from 'vue'

// count.value имеет выведенный тип number
const count = ref(0)

// alice.value имеет тип User или null
const alice = ref<User | null>(null)

// Можно явно указывать тип для реактивных сущностей
const bob: Ref<User | null> = ref(null)
```

### 2.2. Интерфейс компонента

Интерфейс компонента включает пропсы, события и слоты. Исторически Vue был ориентирован на JavaScript, и тип интерфейса
компонента описался на JavaScript. В обычном описании компонента интерфейс описывается также, и Vue выводит тип в простых
случаях, а для более сложных случаев предоставляет утилитные типы.

```ts
import type { PropType, SlotsType } from 'vue'
import { defineComponent } from 'vue'

type User = {
  id: number,
  name: string,
}

// defineComponent в TS обязателен, иначе описываемый объект не воспринимается как Vue компонент
export default defineComponent({
  name: 'UserCard',

  props: {
    // Vue корректно выведет, что параметр `compact` необязательны и имеет тип boolean
    compact: {
      type: Boolean,
      default: false,
    },

    // Vue выведет только, что `user` - объект
    // Через утилитный тип `PropType` можно указать более точный тип используя TS тип
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },

  emits: {
    // Тип параметров событий можно указать через валидатор события
    // Сам валидатор описывать не обязательно, можно просто вернуть true
    'update:compact': (value: boolean) => typeof value === 'boolean',
  },

  // Для типизации слотов используется опция `slots` с типом `SlotsType`
  // На работу компонента эта опция никак не влияет
  slots: Object as SlotsType<{
    // Свойство - имя слота
    default: void,
    // Тип свойства - тип параметров слота (присутствуют у scoped slots)
    info: { user: User },
  }>,
})
```

```smart header="Типизации слотов в Vue в сравнении с children в React"
В концепциях Vue компонент ничего не знает о содержимом слотов.

По этой причине типизация слотов в Vue позволяет только описать имена слотов, и какие у них параметры в **scoped slots**.

Например, нет возможности описать компонент `<UiMenu>`, принимающий в слот только компоненты `<UiMenuItem>`. 
```

## 3. TS в Vue с SFC

### 3.1. `vue-tsc`

Оригинальный TypeScript не поддерживает SFC. Как формат файла `.vue` в целом, так и отдельные его возможности -
например, Vue шаблон в `<template>` или `<script setup>`.

Для компиляции это не проблема - компилятор SFC и сборщик просто вырежут TypeScript. Но для проверки и вывода типов это
проблема.

Для поддержки SFC используют утилиту `vue-tsc`. Он аналогичен оригинальному TS компилятору `tsc`, имеет те же команды и
параметры, но умеет работать с SFC файлами, включая типизацию шаблона и `<script setup>`. Если вы знакомы с TypeScript и
`tsc` - вы умеете работать и с `vue-tsc`.

```smart header="Особенности vue-tsc"
`vue-tsc` - не чистая обёртка над оригинальным `tsc`, он его патчит. Из-за этого есть вероятность, что в Vue не будет 
работать что-то, что работает в TS. Например, при выходе TypeScript 5.7 он 
[не поддерживался](https://github.com/vuejs/language-tools/issues/5018) в `vue-tsc`.
``` 

### 3.2. TS в `<script setup lang="ts">`

Особенно удобно использовать TypeScript в Vue в `<script setup>`. Макросы компиляции позволяют указывать тип интерфейсов
через дженерик. Основное преимущество помимо краткости - возможность использовать цельный тип всех
пропсов/событий/слотов и даже наследовать его от другого типа.

```ts
import type { VNode } from 'vue'
import type { User } from './types.ts'

const { compact = false, user } = defineProps<{
  compact?: boolean,
  user: User,
}>()

// Можно использовать отдельный type/interface и даже наследовать его 

interface CardProps {
  compact?: boolean,
}

interface UserCardProps extends CardProps {
  user: User,
}

const { compact = false, user } = defineProps<UserCardProps>()

// Старый синтаксис
const emit = defineEmits<{
  'update:compact': (value: boolean) => void
}>()

// Новый синтаксис, Vue 3.4+
const emit = defineEmits<{
  'update:compact': [value: boolean]
}>()

const slots = defineSlots<{
  // Документация предлагает описывать слот, как функцию, возвращающую any или void.
  default(): any
  info(props: { user: User }): any
}>()
```

Но с типизацией слотов документация не совсем корректна. 
В ней сказано: "Возвращаемый тип пока что игнорируется и может быть `any`, но в будущем мы можем использовать его для 
проверки содержимого слота". 
В целом по документации `defineSlots` нужен только для описания списка слотов и их параметров. 
На практике это может быть проблемно:

- `defineSlots` может использоваться не только для типизации слотов, но и для получения объекта слотов `slots` - точность
  его типа важна
- Слоты в Vue всегда **необязательные** и должны описываться как опциональные (иначе `slots.default` по типу всегда будет функцией, а может быть `undefined`) 
- Использование `any` часто запрещено в проектах c [`@typescript-eslint/no-explicit-any`](https://typescript-eslint.io/rules/no-explicit-any/)
- Использование `void` не совсем корректно, так как функции в `slots` на самом деле возвращают `VNode[]`

```ts
const slots = defineSlots<{
  // ESLint: Unexpected any. Specify a different type (@typescript-eslint/no-explicit-any)
  default(): any
}>()

// Если слот не передан, будет ошибка "TypeError: undefined is not a function"
// Если слот передан, content будет иметь тип any вместо настоящего типа VNode[]
const content = slots.default()
```

Корректное описание слотов - optional `Slot`:  

```ts
import type { Slot } from 'vue'

defineSlots<{
  /** Контент заголовка */
  default?: Slot
  /** Контент информации о пользователе */
  info?: Slot<{ user: User }>
}>()
```

### 3.3. Generic-компоненты

Vue даже позволяет создавать generic-компоненты, хотя и в необычном виде. Для описания generic типа используют атрибут
`generic` в `<script setup lang="ts" generic"T">`. Этот тип можно использовать в описании типа пропсов, событий, слотов
и локальных переменных.

Например, можно сделать компонент группы радио-кнопок, где тип значения определяется типом значений вариантов кнопок.

```html
<!-- UiRadioGroup - группа радио-кнопок -->
<script setup lang="ts" generic="T extends string">
defineProps<{
  /** Значение группы радио-кнопок */
  modelValue: T,
  /** Описание списка радио-кнопок */
  options: {
    /** Текст радио-кнопки */
    label: string,
    /** Значение радио-кнопки */
    value: T,
  }[],
}>()

defineEmits<{
  'update:modelValue': [value: T],
}>()
</script>

<!-- Использование компонента -->
<!-- Vue выведет, что selected будет иметь значение '1' или '2' -->
<UiRadioGroup v-model="selected" :options="[{ value: '1', label: 'One' }, { value: '2', label: 'Two' }]" />
```

Если вы не знакомы с generic-типами в TypeScript, рекомендуется посмотреть документацию:
- TypeScript Handbook | Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html

### 3.4. Ограничения TS в `<script setup>`

Хотя код выше выглядит, как TypeScript, работает он не через оригинальный TypeScript компилятор. Во Vue описание
параметров нужно не только для собственно типизации, но и для генерации описания пропсов на `js`. Vue в рантайме должен
знать:

- Список параметров, чтобы знать, какие атрибуты передать как `props`, а какие будут наследоваться как атрибуты
- Какие параметры имеют тип `Boolean`, чтобы преобразовать их значение в `true/false`, в том числе 

```html
<UiInput :model-value="num" type="number" data-testid="input" disabled />
```
- `modelValue`, `type` и `disabled` - будут переданы в props так как описаны в `props`/`defineProps`
- `data-testid` - будет передан как атрибут и унаследован на корневом HTML элементе
- `disabled` - будет преобразован как `true`, так как его тип - `Boolean`, иначе бы он передался как пустая строка `disabled=""`

Из-за этого тип в `defineProps`/`defineEmits` - это не просто тип, но и инструкция компилятору для генерации кода 
компонента. По этой причине Vue самостоятельно парсит TS код, и поддерживает только подмножество возможностей TypeScript 
здесь. Хотя с каждой новой версией возможностей всё больше, и в версии 3.5 поддерживаются почти все возможности, от 
некоторых ограничений не избавиться.

Например, для определения всего списка параметров не поддерживаются (поддерживаются для типа одного параметра):

- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

```ts
type User = {
  id: number,
  name: string,
}

defineProps<{
  // Ожидаются пропсы "id" и "name" из типа "User"
  // Но Vue не может это вывести - список будет пустой
  [key: keyof User]: User[key]
}>()

// ---

type InputProps = {
  type: 'text',
  value: string,
} | {
  type: 'checkbox'
  checked: boolean,
  value?: string,
}

// Сработает, но все три параметра будут обязательными
defineProps<InputProps>()

// ---

type InputTextProps = {
  value: T,
}

type InputNumberProps = {
  value: T,
  min?: number,
  max?: number,
}

// Error: [@vue/compiler-sfc] Unresolvable type: TSConditionalType
type InputProps<T extends string | number> = T extends string ? InputTextProps : InputNumberProps

defineProps<InputProps>()
```

Последний пример не работает и при использовании `<script setup generic>`:

```vue
<script setup lang="ts" generic="T extends string | number">
type InputTextProps = {
  value: T,
}

type InputNumberProps = {
  value: T,
  min? : number,
  max? : number,
}

// Error: [@vue/compiler-sfc] Unresolvable type: TSConditionalType
type InputProps = T extends string ? InputTextProps : InputNumberProps

defineProps<InputProps>()
</script>
```

### 4. Получение типов интерфейса компонента

Иногда требуется из описания компонентов получить типы его интерфейсов.

Получить тип компонента можно простым `typeof`, а тип экземпляра - через `InstanceType<typeof Component>`. 
Из него можно достать тип отдельных интерфейсов.

```ts
import UiInput from './UiInput.vue'

// Тип экземпляра компонента
type UiInputInstance = InstanceType<typeof UiInput>

// Тип пропсов, эмитов и слотов компонента
type UiInputProps = InstanceType<typeof UiInput>['$props']
type UiInputEmits = InstanceType<typeof UiInput>['$emit']
type UiInputSlots = InstanceType<typeof UiInput>['$slots']
// Тип модели компонента UiInput
type UiInputModelValue = UiInputProps['modelValue']
```

Но такое простое решение не будет работать с функциональными компонентами и generic-компонентами. Полное решение 
выглядит следующим образом:

```ts
type ComponentProps<T> =
	T extends new (...args: any) => { $props: infer P; } ? NonNullable<P> :
	T extends (props: infer P, ...args: any) => any ? P :
	{}

type UiInputProps = ComponentProps<typeof UiInput>
```

Для этой же цели можно использовать утилиты [vue-component-type-helpers](https://www.npmjs.com/package/vue-component-type-helpers). 
Это очень маленькая библиотека, которую можно изучить по исходникам:
https://github.com/vuejs/language-tools/blob/master/packages/component-type-helpers/index.ts.

```ts
import type { ComponentProps } from 'vue-component-type-helpers'
import UiInput from './UiInput.vue'

type UiInputProps = ComponentProps<typeof UiInput>
type UiInputEmits = ComponentEmits<typeof UiInput>
type UiInputSlots = ComponentSlots<typeof UiInput>
```

Когда ожидается, что типы компонента будут нужны снаружи, можно их сразу экспортировать для удобства.

```ts
export interface UiInputProps {
  modelValue: string,
  type: 'text' | 'number',
}

defineProps<UiInputProps>()
```
