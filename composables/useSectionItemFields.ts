export function useSectionItemFields(props: { item: any; sectionKey: string }, emit: (event: string, ...args: any[]) => void) {
  const updateName = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.name = (evt.target as HTMLInputElement).value
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateLevel = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.level = parseInt((evt.target as HTMLInputElement).value)
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateElement = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.element = (evt.target as HTMLSelectElement).value
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateWeather = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.weather = (evt.target as HTMLSelectElement).value
    emit('updateItem', props.sectionKey, newItem)
  }

  const updatePosition = (position: any) => {
    const newItem = { ...props.item }
    newItem.position = position
    emit('updateItem', props.sectionKey, newItem)
  }

  const addPosition = () => {
    const newItem = { ...props.item }
    if (!Array.isArray(newItem.position)) {
      newItem.position = [newItem.position]
    }
    newItem.position = [...newItem.position, { x: 0, y: 0 }]
    emit('updateItem', props.sectionKey, newItem)
  }

  const setItemPosition = (index: number) => {
    emit('setItemPosition', {
      section: props.sectionKey,
      id: props.item.id,
      index: index
    })
  }

  const updateAggro = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.aggro = (evt.target as HTMLSelectElement).value === '' ? null : (evt.target as HTMLSelectElement).value
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateAdaptation = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.adaptation = { ...newItem.adaptation, canAdapt: (evt.target as HTMLInputElement).checked }
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateMutation = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.mutation = { ...newItem.mutation, canMutate: (evt.target as HTMLInputElement).checked }
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateFate = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.fate = { ...newItem.fate, forFate: (evt.target as HTMLInputElement).checked }
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateAshkin = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.ashkin = (evt.target as HTMLInputElement).checked
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateElemental = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.elemental = (evt.target as HTMLInputElement).checked
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateFauna = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.fauna = (evt.target as HTMLInputElement).checked
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateMachine = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.machine = (evt.target as HTMLInputElement).checked
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateForFateId = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.fate = { ...newItem.fate, fateId: (evt.target as HTMLSelectElement).value }
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateMutationElement = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.mutation = { ...newItem.mutation, element: (evt.target as HTMLSelectElement).value }
    emit('updateItem', props.sectionKey, newItem)
  }

  const addCondition = (type: string) => {
    const newItem = { ...props.item }
    newItem[type] = { ...newItem[type], conditions: [...newItem[type].conditions, { weather: null, time: null }] }
    emit('updateItem', props.sectionKey, newItem)
  }

  const deleteCondition = (type: string, index: number) => {
    const newItem = { ...props.item }
    const newConditions = [...newItem[type].conditions]
    newConditions.splice(index, 1)
    newItem[type] = { ...newItem[type], conditions: newConditions }
    emit('updateItem', props.sectionKey, newItem)
  }

  const changeConditions = (type: string, newConditions: any[]) => {
    const newItem = { ...props.item }
    newItem[type] = { ...newItem[type], conditions: newConditions }
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateBoss = (event: Event, key: string) => {
    const newItem = { ...props.item }
    newItem.boss = { ...newItem.boss, [key]: (event.target as HTMLInputElement).value }
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateParticipants = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.participants = parseInt((evt.target as HTMLInputElement).value)
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateIcon = (icon: string) => {
    const newItem = { ...props.item }
    newItem.icon = icon
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateDrops = (drops: any[]) => {
    const newItem = { ...props.item }
    newItem.drops = drops
    emit('updateItem', props.sectionKey, newItem)
  }

  const addDrop = () => {
    const newItem = { ...props.item }
    newItem.drops = [...newItem.drops, { name: '', amount: 0, percent: 0 }]
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateSpawns = (spawns: any[]) => {
    const newItem = { ...props.item }
    newItem.spawns = spawns
    emit('updateItem', props.sectionKey, newItem)
  }

  const addSpawn = () => {
    const newItem = { ...props.item }
    newItem.spawns = [...newItem.spawns, { type: 'enemy', value: '' }]
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateAttack = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.attack = (evt.target as HTMLSelectElement).value
    emit('updateItem', props.sectionKey, newItem)
  }

  const updateWeakness = (evt: Event) => {
    const newItem = { ...props.item }
    newItem.weakness = (evt.target as HTMLSelectElement).value
    emit('updateItem', props.sectionKey, newItem)
  }

  return {
    updateName,
    updateLevel,
    updateElement,
    updateWeather,
    updatePosition,
    addPosition,
    setItemPosition,
    updateAggro,
    updateAdaptation,
    updateMutation,
    updateFate,
    updateAshkin,
    updateElemental,
    updateFauna,
    updateMachine,
    updateForFateId,
    updateMutationElement,
    addCondition,
    deleteCondition,
    changeConditions,
    updateBoss,
    updateParticipants,
    updateIcon,
    updateDrops,
    addDrop,
    updateSpawns,
    addSpawn,
    updateAttack,
    updateWeakness,
  }
}
