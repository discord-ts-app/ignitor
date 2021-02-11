import Events from '../Types/Events'

export default interface Event {
	readonly name: string
	type: Events
	run(...params: any): void
}
