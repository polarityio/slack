const { requestWithDefaults } = require('../request');

const publishUrlToManifest = async (url) =>
  await requestWithDefaults({
    method: 'POST',
    site: 'slack',
    route: 'apps.manifest.update',
    headers: { 'Content-Type': 'application/json' },
    body: {
      app_id: 'A03NLVDHTTP',
      manifest: JSON.stringify({
        display_information: {
          name: 'Polarity',
          description:
            "Polarity's Slack Application for use in tandem with our Polarity Slack Integration.",
          background_color: '#53a13b'
        },
        features: {
          app_home: {
            home_tab_enabled: true,
            messages_tab_enabled: true,
            messages_tab_read_only_enabled: true
          },
          bot_user: {
            display_name: 'Polarity',
            always_online: true
          },
          slash_commands: [
            {
              command: '/polarity',
              url: `${url}/command`,
              description:
                'The Polarity command will return the results of a search to the Overlay',
              usage_hint: 'Polarity Search Here',
              should_escape: false
            }
          ]
        },
        oauth_config: {
          redirect_urls: ['https://polarity.io/integrations/'],
          scopes: {
            user: [
              'chat:write',
              'search:read',
              'channels:read',
              'mpim:read',
              'im:read',
              'groups:read'
            ],
            bot: [
              'app_mentions:read',
              'channels:read',
              'chat:write',
              'chat:write.customize',
              'chat:write.public',
              'groups:read',
              'groups:write',
              'im:read',
              'mpim:read',
              'groups:history',
              'commands'
            ]
          }
        },
        settings: {
          event_subscriptions: {
            request_url: `${url}/events`,
            bot_events: ['app_home_opened', 'app_mention']
          },
          interactivity: {
            is_enabled: true,
            request_url: `${url}/actions`
          },
          org_deploy_enabled: false,
          socket_mode_enabled: false,
          token_rotation_enabled: false
        }
      })
    }
  });

module.exports = publishUrlToManifest;
