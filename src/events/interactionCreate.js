const { InteractionType, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const { client } = interaction;

        // ====================================================
        // 1. COMANDOS SLASH
        // ====================================================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`[ERRO COMMAND] ${interaction.commandName}:`, error);
                const msg = { content: '❌ Erro ao executar comando!', flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
                else await interaction.reply(msg);
            }
        }

        // ====================================================
        // 2. SELECT MENUS
        // ====================================================
        else if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
            const customId = interaction.customId;

            // --- LÓGICA DE CANAL FINAL (SALVAR ANÚNCIO) ---
            if (customId === 'select_ann_final_channel') {
                const channelId = interaction.values[0];
                const embed = interaction.message.embeds[0];
                const content = interaction.message.content;
                const isEveryone = content.includes('everyone');
                
                const timeMatch = content.match(/🕒 (.*?) \|/);
                const intervalMatch = content.match(/🔁 (.*?)d/);
                
                if (!timeMatch) return interaction.reply({ content: '❌ Erro ao recuperar dados do agendamento.', flags: MessageFlags.Ephemeral });

                const [d, t] = timeMatch[1].split(' ');
                const [day, month, year] = d.split('/');
                const [hh, mm] = t.split(':');
                const date = new Date(year, month - 1, day, hh, mm);

                await client.db.scheduledAnnouncement.create({
                    data: {
                        guildId: interaction.guild.id,
                        channelId: channelId,
                        title: embed.title,
                        content: embed.description,
                        imageUrl: embed.image?.url || null,
                        mentionEveryone: isEveryone,
                        scheduledTime: date,
                        intervalDays: parseInt(intervalMatch?.[1] || '0')
                    }
                });

                return await interaction.update({ content: `✅ **Anúncio Ativado!**\n📅 Disparo: <t:${Math.floor(date.getTime()/1000)}:F>\n📺 Canal: <#${channelId}>`, embeds: [], components: [] });
            }

            if (customId === 'select_ann_delete') {
                await client.db.scheduledAnnouncement.delete({ where: { id: parseInt(interaction.values[0]) } });
                return await interaction.update({ content: '✅ Anúncio removido com sucesso!', components: [], embeds: [] });
            }

            // --- ROLE PANEL PUBLISH (CORREÇÃO DE ROTEAMENTO DINÂMICO) ---
            if (customId.startsWith('select_role_publish_channel_')) {
                const handler = require('../interactions/selects/select_role_publish_channel.js');
                return await handler.execute(interaction);
            }

            let handlerName = customId;

            // --- ROTEAMENTO DINÂMICO ---
            if (customId.startsWith('select_role_add_handler_')) handlerName = 'select_role_add_handler';
            if (customId.startsWith('public_role_panel_')) handlerName = 'public_role_panel';
            if (customId.startsWith('setup_rust_lfg_')) handlerName = 'setup_rust_lfg';
            if (customId === 'suggestion_channel_setup_menu') handlerName = 'select_suggestion_channel_setup';
            if (customId === 'setup_suggestion_channel_pt') handlerName = 'setup_suggestion_channel';
            if (customId === 'setup_suggestion_channel_en') handlerName = 'setup_suggestion_channel';
            if (customId === 'select_rust_server_announce') handlerName = 'select_rust_server_announce';
            if (customId.startsWith('select_rust_channel_final_')) handlerName = 'select_rust_channel_final';
            if (customId === 'rust_channel_config') handlerName = 'rust_channel_config';
            if (customId === 'setup_rust_announce') handlerName = 'setup_rust_announce';
            if (customId === 'setup_rust_logs') handlerName = 'setup_rust_logs';

            if (customId === 'select_community_feature') {
                const value = interaction.values[0];
                if (value === 'module_announcements') {
                    const handler = require(`../interactions/modules/module_announcements.js`);
                    return await handler.execute(interaction);
                }
                handlerName = 'select_community_feature';
            }

            if (customId === 'select_role_panel') handlerName = 'select_role_panel';
            if (customId === 'select_publish_lfg_channel') handlerName = 'select_publish_lfg_channel';
            if (customId === 'select_suggestion_panel_channel') handlerName = 'select_suggestion_panel_channel';
            if (customId === 'setup_ticket_category') handlerName = 'setup_ticket_category';
            if (customId === 'setup_ticket_logs') handlerName = 'setup_ticket_logs';
            if (customId === 'setup_ticket_role') handlerName = 'setup_ticket_role';
            if (customId === 'setup_welcome_channel') handlerName = 'setup_welcome_channel';
            if (customId === 'setup_bye_channel') handlerName = 'setup_bye_channel';
            if (customId === 'setup_security_logs') handlerName = 'setup_security_logs';
            if (customId === 'select_gw_edit') handlerName = 'select_gw_edit';

            try {
                const handler = require(`../interactions/selects/${handlerName}.js`);
                await handler.execute(interaction);
            } catch (err) {
                // Silencioso
            }
        }

        // ====================================================
        // 3. BOTÕES
        // ====================================================
        else if (interaction.isButton()) {
            const customId = interaction.customId;

            // --- SISTEMA DE ANÚNCIOS (CENTRALIZADO) ---
            if (customId.startsWith('btn_ann_')) {
                const moduleAnn = require('../interactions/modules/module_announcements.js');
                const currentEmbed = interaction.message?.embeds?.[0] || {};
                const content = interaction.message?.content || "";
                const isEveryone = content.includes('everyone');

                if (customId === 'btn_ann_new') {
                    return await moduleAnn.execute(interaction, { title: 'Novo Anúncio', content: 'Mensagem...', mentionEveryone: false });
                }
                
                // VOLTAR PARA A LISTA
                if (customId === 'btn_ann_back') {
                    return await moduleAnn.execute(interaction);
                }

                if (customId === 'btn_ann_delete_list') {
                    const announcements = await client.db.scheduledAnnouncement.findMany({ where: { guildId: interaction.guild.id } });
                    if (announcements.length === 0) return interaction.reply({ content: '❌ Nenhum anúncio para excluir.', flags: MessageFlags.Ephemeral });
                    
                    const select = new StringSelectMenuBuilder()
                        .setCustomId('select_ann_delete')
                        .setPlaceholder('Escolha o anúncio...')
                        .addOptions(announcements.slice(0, 25).map(a => ({ label: a.title.substring(0, 25), value: a.id.toString(), description: `ID: ${a.id}` })));
                    
                    return await interaction.reply({ content: '🗑️ **Selecione para excluir:**', components: [new ActionRowBuilder().addComponents(select)], flags: MessageFlags.Ephemeral });
                }

                if (customId === 'btn_ann_set_text') {
                    const modal = new ModalBuilder().setCustomId('modal_ann_text').setTitle('Texto do Anúncio');
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Título').setStyle(TextInputStyle.Short).setValue(currentEmbed.title || '').setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('content').setLabel('Mensagem').setStyle(TextInputStyle.Paragraph).setValue(currentEmbed.description || '').setRequired(true))
                    );
                    return await interaction.showModal(modal);
                }

                if (customId === 'btn_ann_set_image') {
                    const modal = new ModalBuilder().setCustomId('modal_ann_image').setTitle('Banner do Anúncio');
                    modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('url').setLabel('Link da Imagem').setStyle(TextInputStyle.Short).setValue(currentEmbed.image?.url || '').setRequired(true)));
                    return await interaction.showModal(modal);
                }

                if (customId === 'btn_ann_toggle_everyone') {
                    return await moduleAnn.execute(interaction, {
                        title: currentEmbed.title, content: currentEmbed.description,
                        imageUrl: currentEmbed.image?.url, mentionEveryone: !isEveryone
                    });
                }

                if (customId === 'btn_ann_confirm_save') {
                    const modal = new ModalBuilder().setCustomId('modal_ann_finalize').setTitle('Agendar Anúncio');
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('time').setLabel('Data (DD/MM/AAAA HH:MM)').setPlaceholder('Ex: 20/02/2026 15:30').setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('interval').setLabel('Repetir a cada X dias? (0=Não)').setValue('0').setStyle(TextInputStyle.Short))
                    );
                    return await interaction.showModal(modal);
                }
                return; 
            }

            // BOTÃO CANCELAR/VOLTAR DO ANÚNCIO (NOVO)
            if (customId === 'module_announcements') {
                const handler = require('../interactions/modules/module_announcements.js');
                return await handler.execute(interaction);
            }

            let handlerName = customId;

            // --- ROTEAMENTO GERAL ---
            if (customId === 'btn_lfg_banner') handlerName = 'btn_lfg_banner';
            if (customId === 'btn_set_timezone') handlerName = 'btn_set_timezone';
            if (customId === 'publish_ticket_panel') handlerName = 'publish_ticket_panel';
            if (customId === 'btn_test_suggest') handlerName = 'btn_test_suggest';
            if (customId === 'test_welcome') handlerName = 'test_welcome';

            if (customId.startsWith('btn_mapvote_')) handlerName = 'btn_mapvote';
            if (customId.startsWith('rate_')) handlerName = 'ratingHandler';
            if (customId === 'staff_tools') handlerName = 'ticketHandler';
            if (customId.startsWith('open_ticket')) handlerName = 'ticketHandler';
            if (customId.startsWith('close_ticket')) handlerName = 'ticketHandler';
            if (customId.startsWith('claim_ticket')) handlerName = 'ticketHandler';
            if (customId === 'lookup_ticket_btn') handlerName = 'lookup_ticket_btn';
            
            if (customId.startsWith('suggestion_vote')) handlerName = 'suggestion_vote';
            if (customId.startsWith('suggestion_approve_')) handlerName = 'suggestion_admin';
            if (customId.startsWith('suggestion_deny_')) handlerName = 'suggestion_admin';
            if (customId.startsWith('suggestion_analyze_')) handlerName = 'suggestion_admin';
            if (customId.startsWith('suggestion_thread_')) handlerName = 'suggestion_admin';
            if (customId === 'btn_publish_suggestion_panel') handlerName = 'btn_publish_suggestion_panel';
            if (customId === 'btn_set_suggestion_banner') handlerName = 'btn_set_suggestion_banner';
            if (customId === 'btn_suggest_pt') handlerName = 'btn_suggest_pt';
            if (customId === 'btn_suggest_en') handlerName = 'btn_suggest_en';

            if (customId.startsWith('rust_set_wipe_')) handlerName = 'rust_set_wipe';
            if (customId.startsWith('rust_set_image_')) handlerName = 'rust_set_image';
            if (customId.startsWith('rust_toggle_player_')) handlerName = 'rust_toggle_player';
            if (customId.startsWith('rust_toggle_wipe_')) handlerName = 'rust_toggle_wipe';
            if (customId.startsWith('rust_delete_')) handlerName = 'rust_delete';
            
            if (customId.startsWith('btn_rust_lang_')) handlerName = 'btn_rust_lang';
            if (customId.startsWith('btn_rust_msg_custom_')) handlerName = 'btn_rust_msg_custom';
            if (customId.startsWith('btn_rust_connect_')) handlerName = 'btn_rust_connect';
            
            if (customId === 'btn_add_rust_server') handlerName = 'btn_add_rust_server';
            if (customId === 'module_rust_btn') handlerName = 'module_rust_btn';
            if (customId === 'btn_toggle_announce') handlerName = 'btn_toggle_announce';
            if (customId === 'toggle_rust_counter') handlerName = 'toggle_rust_counter';

            if (customId === 'module_rust_lfg') handlerName = 'module_rust_lfg';
            if (customId === 'btn_publish_lfg_interface') handlerName = 'btn_publish_lfg_interface';
            if (customId.startsWith('btn_lfg_start_')) handlerName = 'btn_lfg_start';
            if (customId.startsWith('btn_lfg_connect_')) handlerName = 'btn_lfg_connect';

            if (customId === 'module_roles_btn') handlerName = 'module_roles_btn';
            if (customId === 'btn_create_role_panel') handlerName = 'btn_create_role_panel';
            
            // --- CORREÇÃO DO ROLE BANNER E PUBLISH (Permite estático e dinâmico) ---
            if (customId.startsWith('btn_role_add_')) handlerName = 'btn_role_add';
            if (customId.startsWith('btn_role_edit_text_')) handlerName = 'btn_role_edit_text';
            if (customId.startsWith('btn_role_publish')) handlerName = 'btn_role_publish'; // <--- CORREÇÃO DE PUBLISH
            if (customId.startsWith('btn_role_delete_')) handlerName = 'btn_role_delete';
            if (customId.startsWith('btn_role_toggle_')) handlerName = 'btn_role_toggle';
            if (customId.startsWith('btn_role_set_banner')) handlerName = 'btn_role_set_banner'; // <--- FIXADO (Era _ no final)

            if (customId === 'module_community') handlerName = 'module_community';
            if (customId === 'module_auto_response_btn') handlerName = 'module_auto_response_btn';
            if (customId === 'btn_toggle_autoresponse') handlerName = 'btn_toggle_autoresponse';
            if (customId === 'btn_create_giveaway') handlerName = 'btn_create_giveaway';
            if (customId === 'btn_join_giveaway') handlerName = 'btn_join_giveaway';
            if (customId === 'btn_admin_gw_control') handlerName = 'btn_admin_gw_control';

            if (customId === 'btn_toggle_antilink') handlerName = 'btn_toggle_antilink';
            if (customId === 'btn_toggle_antitoxic') handlerName = 'btn_toggle_antitoxic';
            if (customId === 'btn_toggle_antispam') handlerName = 'btn_toggle_antispam';
            if (customId === 'btn_toggle_antimedia') handlerName = 'btn_toggle_antimedia';
            if (customId === 'btn_toggle_transcript_dm') handlerName = 'btn_toggle_transcript_dm';

            if (customId === 'back_to_tickets') handlerName = 'back_to_tickets';
            if (customId === 'back_to_community') handlerName = 'back_to_community';
            if (customId === 'back_to_main') handlerName = 'back_to_main';

            if (customId === 'btn_create_response') handlerName = 'btn_create_response';
            if (customId === 'btn_delete_response') handlerName = 'btn_delete_response';
            if (customId.startsWith('btn_gw_')) handlerName = customId.split('_').slice(0,3).join('_');
            if (customId === 'btn_create_dep') handlerName = 'btn_create_dep';
            if (customId === 'btn_create_mapvote') handlerName = 'btn_create_mapvote';
            if (customId === 'btn_set_antifake') handlerName = 'btn_set_antifake';
            if (customId === 'btn_set_mentions') handlerName = 'btn_set_mentions';

            try {
                const handler = require(`../interactions/buttons/${handlerName}.js`);
                if (typeof handler === 'function') await handler(interaction);
                else if (handler.execute) await handler.execute(interaction);
            } catch (err) {
                if (!interaction.replied) await interaction.reply({ content: '❌ Botão não configurado.', flags: MessageFlags.Ephemeral });
            }
        }

        // ====================================================
        // 4. MODALS
        // ====================================================
        else if (interaction.type === InteractionType.ModalSubmit) {
            const customId = interaction.customId;

            if (customId === 'modal_ann_text' || customId === 'modal_ann_image') {
                const moduleAnn = require('../interactions/modules/module_announcements.js');
                const currentEmbed = interaction.message?.embeds?.[0] || {};
                const content = interaction.message?.content || "";
                let title = currentEmbed.title, desc = currentEmbed.description, url = currentEmbed.image?.url;

                if (customId === 'modal_ann_text') {
                    title = interaction.fields.getTextInputValue('title');
                    desc = interaction.fields.getTextInputValue('content');
                } else {
                    url = interaction.fields.getTextInputValue('url');
                }

                return await moduleAnn.execute(interaction, {
                    title: title, content: desc, imageUrl: url,
                    mentionEveryone: content.includes('everyone')
                });
            }

            let handlerName = customId;
            
            // --- MODALS DO ROLE CENTER (FIXADO) ---
            if (customId.startsWith('modal_role_set_banner')) handlerName = 'modal_role_set_banner';
            
            if (customId === 'modal_lfg_banner') handlerName = 'modal_lfg_banner';
            if (customId === 'modal_ann_finalize') handlerName = 'modal_ann_finalize';
            if (customId.startsWith('modal_rust_msg_')) handlerName = 'modal_rust_msg';
            if (customId === 'modal_mapvote') handlerName = 'modal_mapvote';
            if (customId.startsWith('modal_suggest')) handlerName = 'modal_suggest';
            if (customId.startsWith('modal_rust_server_wipe_')) handlerName = 'modal_rust_server_wipe';
            if (customId.startsWith('modal_rust_image_')) handlerName = 'modal_rust_image';
            if (customId.startsWith('modal_role_option_')) handlerName = 'modal_role_option';
            if (customId.startsWith('modal_role_edit_text_')) handlerName = 'modal_role_edit_text';
            if (customId.startsWith('modal_lfg_submit_')) handlerName = 'modal_lfg_submit';
            if (customId.startsWith('modal_gw_edit_')) handlerName = 'modal_gw_edit';
            
            if (customId === 'modal_create_dep') handlerName = 'modal_create_dep';
            if (customId === 'modal_create_giveaway') handlerName = 'modal_create_giveaway';
            if (customId === 'modal_create_response') handlerName = 'modal_create_response';
            if (customId === 'modal_lookup_ticket') handlerName = 'modal_lookup_ticket';
            if (customId === 'modal_remove_member') handlerName = 'modal_remove_member';
            if (customId === 'modal_rename_ticket') handlerName = 'modal_rename_ticket';
            if (customId === 'modal_add_member') handlerName = 'modal_add_member';
            if (customId === 'modal_add_rust_server') handlerName = 'modal_add_rust_server';
            if (customId === 'modal_rust_date') handlerName = 'modal_rust_date';
            if (customId === 'modal_rust_server') handlerName = 'modal_rust_server';
            if (customId === 'modal_rust_timezone') handlerName = 'modal_rust_timezone';
            if (customId === 'modal_set_antifake') handlerName = 'modal_set_antifake';
            if (customId === 'modal_set_massmention') handlerName = 'modal_set_massmention';
            if (customId === 'modal_set_suggestion_banner') handlerName = 'modal_set_suggestion_banner';
            if (customId === 'modal_ticket_ui') handlerName = 'modal_ticket_ui';

            try {
                const handler = require(`../interactions/modals/${handlerName}.js`);
                await handler.execute(interaction);
            } catch (err) {
                if (!interaction.replied) await interaction.reply({ content: '❌ Erro no Modal.', flags: MessageFlags.Ephemeral });
            }
        }
    },
};