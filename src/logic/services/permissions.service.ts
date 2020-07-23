import { GuildMember, Message } from 'discord.js';
import { ICommandPermissions, CommandPermissionType, CommandPermissionResult, 
        CommandPermissionResultStatus } from '../../models/CommandPermission';
import { DiscordHelper } from '../helpers/discord.helper';

export class CommandPermissionsService {
    // tslint:disable-next-line:cyclomatic-complexity
    public hasPermissions(command: ICommandPermissions, msg: Message): CommandPermissionResult {
        let returnResult: CommandPermissionResult = new CommandPermissionResult();
        returnResult.permissionStatus = CommandPermissionResultStatus.hasPermission;

        let guildMember: GuildMember = msg.member;
        for (let requirement of command.permissionRequirements.allRequirements) {
            switch (requirement.permissionType) {
                case CommandPermissionType.guild:
                    if (!this.isGuild(guildMember, requirement.identifier)) {
                        returnResult.permissionStatus = CommandPermissionResultStatus.noPermission;
                    }
                    break;
                case CommandPermissionType.role:
                    if (!this.userIsInRole(guildMember, requirement.identifier)) {
                        returnResult.permissionStatus = CommandPermissionResultStatus.noPermission;
                    }
                    break;
                case CommandPermissionType.user:
                    if (!this.userIsCertainUser(guildMember, requirement.identifier)) {
                        returnResult.permissionStatus = CommandPermissionResultStatus.noPermission;
                    }
                    break;
                case CommandPermissionType.textchannel:
                    if (!this.msgIsInTextChannelById(msg, requirement.identifier)) {
                        returnResult.permissionStatus = CommandPermissionResultStatus.noPermission;
                    }
                    break;
                case CommandPermissionType.anytextchannel:
                    if (!this.msgIsInTextChannel(msg)) {
                        returnResult.permissionStatus = CommandPermissionResultStatus.noPermission;
                    }
                    break;
                default:
            }

            if (returnResult.permissionStatus === CommandPermissionResultStatus.noPermission) {
                returnResult.failedCommandRequirements.push(requirement);
                
                return returnResult;
            }
        }

        if (command.permissionRequirements.anyRequirements.length > 0) {
            returnResult.permissionStatus = CommandPermissionResultStatus.noPermission;
            let anyRequirementMet: boolean = false;
            for (let requirement of command.permissionRequirements.anyRequirements) {
                switch (requirement.permissionType) {
                    case CommandPermissionType.guild:
                        if (this.isGuild(guildMember, requirement.identifier)) {
                            anyRequirementMet = true;
                        } else {
                            returnResult.failedCommandRequirements.push(requirement);
                        }
                        break;
                    case CommandPermissionType.role:
                        if (this.userIsInRole(guildMember, requirement.identifier)) {
                            anyRequirementMet = true;
                        } else {
                            returnResult.failedCommandRequirements.push(requirement);
                        }
                        break;
                    case CommandPermissionType.user:
                        if (this.userIsCertainUser(guildMember, requirement.identifier)) {
                            anyRequirementMet = true;
                        } else {
                            returnResult.failedCommandRequirements.push(requirement);
                        }
                        break;
                    case CommandPermissionType.textchannel:
                        if (this.msgIsInTextChannelById(msg, requirement.identifier)) {
                            anyRequirementMet = true;
                        } else {
                            returnResult.failedCommandRequirements.push(requirement);
                        }
                        break;
                    case CommandPermissionType.anytextchannel:
                        if (this.msgIsInTextChannel(msg)) {
                            anyRequirementMet = true;
                        } else {
                            returnResult.failedCommandRequirements.push(requirement);
                        }
                        break;
                    default:
                }

                if (anyRequirementMet) {
                    returnResult.permissionStatus = CommandPermissionResultStatus.hasPermission;
                }
            }
        }
        
        return returnResult;
    }

    private isGuild(guildMember: GuildMember, guildIdentifier: string): boolean {
        let helper: DiscordHelper = new DiscordHelper();

        return helper.doesGuildMatchId(guildMember.guild, guildIdentifier);
    }

    private userIsInRole(guildMember: GuildMember, roleIdentifier: string): boolean {
        let identifierLowered: string = roleIdentifier.toLowerCase();
        for (let role of guildMember.roles.cache) {
            if (role[1].name.toLowerCase() === identifierLowered) {
                return true;
            }
            if (role[1].id === roleIdentifier) {
                return true;
            }
        }

        return false;
    }

    private userIsCertainUser(guildMember: GuildMember, userIdentifier: string): boolean {
        let helper: DiscordHelper = new DiscordHelper();

        return helper.doesGuildMemberMatchId(guildMember, userIdentifier);
    }

    private msgIsInTextChannelById(msg: Message, channelIdentifier: string): boolean {
        let helper: DiscordHelper = new DiscordHelper();

        return helper.msgIsInTextChannelById(msg, channelIdentifier);
    }

    private msgIsInTextChannel(msg: Message): boolean {
        let helper: DiscordHelper = new DiscordHelper();

        return helper.msgIsInTextChannel(msg);
    }
}
