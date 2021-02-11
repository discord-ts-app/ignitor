import Core from '@discord-ts-app/core'
import Env from '@discord-ts-app/env'
import Guard from '@discord-ts-app/guard'
import Loader from '@discord-ts-app/loader'
import { Lifecycle } from '@discord-ts-app/lifecycle'
import { Client, Message } from 'discord.js'
import Event from './Interfaces/Event'

export default class Ignitor {
	public core: Core
	public client: Client
	private guard: Guard

	constructor(dirname: string) {
		this.client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'USER', 'REACTION'] })
		this.core = new Core(this.client, {
			middlewares: this.fetchMiddlewares(dirname),
			events: this.fetchEvents(dirname),
			commands: this.fetchCommands(dirname),
			modules: this.fetchModules(dirname)
		})
		new Lifecycle('createDiscordClient')
		this.guard = new Guard(this.core)
		this.client.on('message', async (message: Message) => await this.guard.protect(this.core, message))
		new Lifecycle('starting')
	}

	private fetchEvents(dirname: string): Array<any> {
		const events: Array<Event> = []
		const loader = new Loader(`${dirname}/${Env.get('EVENTS_FOLDER') || 'Events'}`)

		loader.fetch().map(async (event: any) => {
			const instance = new (require(event).default)()
			if (!Object.getPrototypeOf(instance).unused) {
				events.push(instance)
				new Lifecycle('eventLoaded', instance)
			}
		})

		return events
	}

	private fetchCommands(dirname: string): Array<any> {
		const commands: Array<any> = []
		const loader = new Loader(`${dirname}/${Env.get('COMMANDS_FOLDER') || 'Commands'}`)

		loader.fetch().map(async (command: any) => {
			const instance = new (require(command).default)()
			if (!Object.getPrototypeOf(instance).unused) {
				commands.push(instance)
				new Lifecycle('commandLoaded', instance)
			}
		})

		return commands
	}

	private fetchMiddlewares(dirname: string): Array<any> {
		const middlewares: Array<any> = []
		const loader = new Loader(`${dirname}/${Env.get('MIDDLEWARES_FOLDER') || 'Middlewares'}`)

		loader.fetch().map(async (middleware: any) => {
			const instance = new (require(middleware).default)()
			if (!Object.getPrototypeOf(instance).unused) {
				middlewares.push(instance)
				new Lifecycle('middlewareLoaded', instance)
			}
		})

		return middlewares
	}

	private fetchModules(dirname: string): Array<any> {
		const modules: Array<any> = []
		const loader = new Loader(`${dirname}/${Env.get('MODULES_FOLDER') || 'Modules'}`)

		loader.fetch().map(async (module: any) => {
			const a = require(module)
			modules.push(new a.default())
		})

		return modules
	}
}
