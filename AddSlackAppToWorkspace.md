# Create Polarity Slack App

1. Go to https://api.slack.com/apps/
2. Click on `Create New App` 
    <div>
      <img alt="Click on Create New App" src="./assets/click-on-create-new-app.png">
    </div>

3. Select `From an app manifest`
    <div>
      <img alt="Click on From App Manifest" src="./assets/click-from-an-app-manifest.png">
    </div>

4. Select your workspace you would like the integration to run on via the dropdown, then Click `Next`
    <div>
      <img alt="Select Workspace" src="./assets/select-workspace-from-dropdown.png">
    </div>

5. Delete the contents of the YAML App Manifest
    <div>
      <img alt="Delete App Manifest" src="./assets/delete-app-manifest.png">
    </div>

6. Paste in ***this*** App Manifest in the empty input, then Click `Next`:
    ```yaml
    display_information:
      name: Polarity
      description: Polarity's Slack Application for use in tandem with our Polarity Slack Integration.
      background_color: "#53a13b"
    features:
      app_home:
        home_tab_enabled: false
        messages_tab_enabled: false
        messages_tab_read_only_enabled: false
      bot_user:
        display_name: Polarity
        always_online: true
    oauth_config:
      scopes:
        user:
          - search:read
        bot:
          - channels:read
          - groups:read
          - im:read
          - mpim:read
          - chat:write
          - chat:write.customize
          - chat:write.public
          - users:read
          - users.profile:read

    settings:
      org_deploy_enabled: false
      socket_mode_enabled: false
      token_rotation_enabled: false
    ```

7. Click `Create`
    <div>
      <img alt="Click Create" src="./assets/click-create.png">
    </div>

8. On the `Polarity` Slack app page it brings you to, click `Install to Workspace`
    <div>
      <img alt="Install to Workspace" src="./assets/install-to-workspace.png">
    </div>

9. Click `Allow`
    > ***NOTE:*** The user that clicks allow will determine which private channels can be searched. Creating a new user with access to the private channels you want to search and clicking `Allow` while logged into this user is recommended.
    <div>
      <img alt="Click Allow" src="./assets/click-allow.png">
    </div>

10. Download the image found here: https://github.com/polarityio/slack/raw/develop/assets/app-profile-picture.png
    <div>
      <img width="75"style="border-radius: 49%" alt="App Profile Picture" src="./assets/app-profile-picture.png">
    </div>
    
11. On the `Basic Information` tab
    <div>
      <img alt="Basic Information Tab" src="./assets/basic-info-tab.png">
    </div>
- Scroll down to the `Display Information` section, click `+ Add App Icon`, and select the image from `Step 10`.
    <div>
      <img alt="Add Icon" src="./assets/add-icon.png">
    </div>

12.  Now you `User Token` and `Bot Token` can be found on the `OAuth & Permissions` tab
    <div>
      <img alt="Get User and Bot Token" src="./assets/get-tokens.png">
    </div>
