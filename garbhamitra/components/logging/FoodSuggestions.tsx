'use client'

import type { Profile } from '@/types'

function getHour() {
  return new Date().getHours()
}

function getSuggestions(profile: Profile): string[] {
  const hour = getHour()
  const isVeg =
    profile.food_preference === 'vegetarian' || profile.food_preference === 'jain'
  const isNonVeg = profile.food_preference === 'non-vegetarian'

  if (hour < 11) {
    return isVeg
      ? ['Poha', 'Upma', 'Idli', 'Paratha with curd', 'Banana', 'Chai with milk']
      : ['Poha', 'Upma', 'Egg bhurji', 'Paratha', 'Banana', 'Chai']
  }
  if (hour < 15) {
    return isNonVeg
      ? ['Dal chawal', 'Chicken curry roti', 'Fish curry rice', 'Rajma rice']
      : ['Dal chawal', 'Rajma rice', 'Palak paneer roti', 'Chole bhature', 'Sambhar rice']
  }
  if (hour < 18) {
    return ['Makhana', 'Peanuts', 'Apple', 'Coconut water', 'Chai with milk', 'Banana']
  }
  return isNonVeg
    ? ['Dal rice', 'Khichdi', 'Chicken curry', 'Daal makhani', 'Warm milk']
    : ['Dal rice', 'Khichdi', 'Palak sabzi roti', 'Warm milk', 'Paneer paratha']
}

function getLabel(): string {
  const h = getHour()
  if (h < 11) return 'Morning suggestions'
  if (h < 15) return 'Lunch ideas'
  if (h < 18) return 'Afternoon snack options'
  return 'Dinner ideas'
}

type Props = { profile: Profile; onSelect: (food: string) => void }

export default function FoodSuggestions({ profile, onSelect }: Props) {
  const suggestions = getSuggestions(profile)
  const label = getLabel()

  return (
    <div className="px-4 py-4">
      <p className="text-xs font-medium mb-3" style={{ color: '#9B9590' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className="px-3 py-2 rounded-2xl text-sm border transition-all hover:opacity-80"
            style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFFFF', color: '#4A4540' }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
