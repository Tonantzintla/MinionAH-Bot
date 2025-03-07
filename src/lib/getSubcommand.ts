import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";

type GenericInteractionType = ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType> | AutocompleteInteraction<CacheType>;

export default function getSubcommand(interaction: GenericInteractionType) { return (interaction.options as Omit<CommandInteractionOptionResolver<CacheType>, "">).getSubcommand() }