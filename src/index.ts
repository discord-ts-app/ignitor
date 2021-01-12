import Bot from '@discord-ts-app/core'
import Env from '@discord-ts-app/env'
import Guard from '@discord-ts-app/guard'
import Loader from '@discord-ts-app/loader'
import { Client, Message } from 'discord.js'

import Event from './Interfaces/Event'

export default class Ignitor {
	private bot: Bot
	public client: Client
	private guard: Guard

	constructor(dirname: string) {
		this.client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'USER', 'REACTION'] })
		this.bot = new Bot(this.client, {
			events: this.fetchEvents(dirname),
			commands: this.fetchCommands(dirname),
			middlewares: this.fetchMiddlewares(dirname),
			modules: this.fetchModules(dirname)
		})
		this.guard = new Guard(this.bot)
		this.messages()
	}

	public fetchEvents(dirname: string): Array<any> {
		const events: Array<Event> = []
		const loader = new Loader(`${dirname}/${Env.get('EVENTS_FOLDER') || 'Events'}`)

		loader.fetch().map(async (event: any) => {
			const instance = new (require(event).default)()
			if (!Object.getPrototypeOf(instance).unused) events.push(instance)
		})

		return events
	}

	public fetchCommands(dirname: string): Array<any> {
		const commands: Array<any> = []
		const loader = new Loader(`${dirname}/${Env.get('COMMANDS_FOLDER') || 'Commands'}`)

		loader.fetch().map(async (command: any) => {
			const instance = new (require(command).default)()
			if (!Object.getPrototypeOf(instance).unused) commands.push(instance)
		})

		return commands
	}

	public fetchMiddlewares(dirname: string): Array<any> {
		const middlewares: Array<any> = []
		const loader = new Loader(`${dirname}/${Env.get('MIDDLEWARES_FOLDER') || 'Middlewares'}`)

		loader.fetch().map(async (middleware: any) => {
			const instance = new (require(middleware).default)()
			if (!Object.getPrototypeOf(instance).unused) middlewares.push(instance)
		})

		return middlewares
	}

	public fetchModules(dirname: string): Array<any> {
		const modules: Array<any> = []
		const loader = new Loader(`${dirname}/${Env.get('MODULES_FOLDER') || 'Modules'}`)

		loader.fetch().map(async (module: any) => {
			const a = require(module)
			modules.push(new a.default())
		})

		return modules
	}

	public messages() {
		this.client.on('message', async (message: Message) => {
			await this.guard.protect(this.bot, message)
		})
	}
}
