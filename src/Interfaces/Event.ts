import Events from '@discord-ts-app/core/build/enums/Events'

export default interface Event {
	readonly name: string
	type: Events
	run(...params: any): void
}
