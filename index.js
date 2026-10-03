const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType, 
  PermissionsBitField 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Bot de Suporte Profissional online como ${client.user.tag}!`);
});

// Painel principal de atendimento com Dropdown (Menu de Seleção)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ticket-painel') {
    const embedPainel = new EmbedBuilder()
      .setTitle('🛠️ Central de Atendimento & Suporte')
      .setDescription('Seja bem-vindo ao suporte! Selecione abaixo a categoria que melhor atende à sua necessidade para abrir um ticket privado.')
      .setColor('#5865F2')
      .setFooter({ text: 'Sistema de Atendimento Automático' })
      .setTimestamp();

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_categoria')
        .setPlaceholder('Selecione o motivo do suporte...')
        .addOptions([
          { label: 'Dúvidas Gerais', value: 'duvidas', description: 'Tire suas dúvidas sobre nossa comunidade/serviços', emoji: '❓' },
          { label: 'Financeiro & Vendas', value: 'financeiro', description: 'Assuntos relacionados a pagamentos e compras', emoji: '💳' },
          { label: 'Reportar Bug', value: 'bug', description: 'Encontrou algum problema técnico ou falha?', emoji: '🐛' },
          { label: 'Outros Assuntos', value: 'outros', description: 'Fale com a nossa equipe sobre outros temas', emoji: '📩' },
        ])
    );

    await message.channel.send({ embeds: [embedPainel], components: [menu] });
  }
});

// Manipulação das interações (Menu e Botões)
client.on('interactionCreate', async (interaction) => {
  // Abertura do ticket via Menu Dropdown
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_categoria') {
    const categoria = interaction.values[0];
    const nomeCanal = `ticket-${categoria}-${interaction.user.username.toLowerCase()}`;

    const canalExistente = interaction.guild.channels.cache.find(c => c.name === nomeCanal);
    if (canalExistente) {
      return interaction.reply({ 
        content: `❌ Você já possui um ticket em aberto nesta categoria: ${canalExistente}`, 
        ephemeral: true 
      });
    }

    const canal = await interaction.guild.channels.create({
      name: nomeCanal,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      ],
    });

    const embedTicket = new EmbedBuilder()
      .setTitle(`Atendimento — Categoria: ${categoria.toUpperCase()}`)
      .setDescription(`Olá ${interaction.user}, um membro da nossa equipe atenderá você em breve!\n\nDescreva detalhadamente o seu problema ou dúvida para agilizar a resposta.`)
      .setColor('#57F287')
      .setTimestamp();

    const botõesTicket = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
      new ButtonBuilder().setCustomId('chamar_suporte').setLabel('Notificar Suporte').setStyle(ButtonStyle.Secondary).setEmoji('🔔')
    );

    await canal.send({ content: `${interaction.user}`, embeds: [embedTicket], components: [botõesTicket] });
    await interaction.reply({ content: `✅ Ticket criado com sucesso! Acesse: ${canal}`, ephemeral: true });
  }

  // Notificar equipe
  if (interaction.isButton() && interaction.customId === 'chamar_suporte') {
    await interaction.reply({ content: `🔔 A equipe de suporte foi notificada sobre a sua solicitação!` });
  }

  // Encerramento do ticket
  if (interaction.isButton() && interaction.customId === 'fechar_ticket') {
    const embedFechamento = new EmbedBuilder()
      .setTitle('🔒 Encerrando Atendimento')
      .setDescription('Este ticket será deletado em **5 segundos**.')
      .setColor('#ED4245');

    await interaction.reply({ embeds: [embedFechamento] });

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

// Coloque seu Token aqui
client.login('SEU_TOKEN_AQUI');