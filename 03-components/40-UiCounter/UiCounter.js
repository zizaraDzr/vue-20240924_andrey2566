import { computed, defineComponent, toRef } from 'vue'
import { UiButton } from '@shgk/vue-course-ui'
import './UiCounter.css'

export default defineComponent({
  name: 'UiCounter',

  components: {
    UiButton,
  },

  props: {
    count: {
      type: Number,
      required: true,
    },

    min: {
      type: Number,
      default: 0,
    },

    max: {
      type: Number,
      default: Infinity,
    },
  },

  emits: ['update:count'],

  setup(props, { emit }) {
    // Рекомендуется для практики реализовать обработку событий внутри setup, а не непосредственно в шаблоне
    const count = toRef(() => props.count)

    function decrement() {
      emit('update:count', count.value - 1)
    }

    function increment() {
      emit('update:count', count.value + 1)
    }

    const isDisabledDecrement = computed(() => {
      return count.value === props.min
    })
    const isDisabledIncrement = computed(() => {
      return count.value === props.max
    })

    return {
      decrement,
      increment,
      isDisabledIncrement,
      isDisabledDecrement,
    }
  },

  template: `
    <div class="counter">
      <!-- <UiButton aria-label="Decrement" @click="$emit('change', 1)">➖</UiButton> -->
      <UiButton
        aria-label="Decrement"
        :disabled="isDisabledDecrement"
        @click="decrement"
       >➖</UiButton>
      <span class="count" data-testid="count">{{ count }}</span>
      <UiButton
        aria-label="Increment"
        :disabled="isDisabledIncrement"
        @click="increment"
       >➕</UiButton>
    </div>
  `,
})
