# Personal Website - soli.blue

Vue.js 2.x personal website hosted at https://soli.blue

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Dev server at localhost:8080 with hot reload
npm run build    # Production build (outputs to dist/)
npm run lint     # ESLint for .js and .vue files
```

## Project Structure

```
src/
├── views/          # Page components (Home, Pins, Resume, Plugins, Projects, BuildHome)
├── components/     # Reusable components (BackButton, BaseHome)
├── router/         # Vue Router configuration
├── assets/         # Static assets + JSON data (pins, plugins, projects, resume)
├── mixins/         # Vue mixins (StyleMixin)
├── App.vue         # Root component
└── main.js         # Entry point
build/              # Webpack build configuration
config/             # Environment configs (dev/prod)
```

## Routes

- `/` - Home
- `/pins` - Pins
- `/resume` - Resume
- `/plugins` - Plugins
- `/projects` - Projects
- `/animation` - BuildHome animation

## Tech Stack

- Vue 2.5 + Vue Router 3
- Firebase (hosting)
- Webpack 3
- Babel + ESLint (airbnb-base)

## Data Files

Content is managed via JSON files in `src/assets/`:
- `pins.json` - Map pins data
- `plugins.json` - Plugins list
- `projects.json` - Projects list
- `resume.json` - Resume data

## Development Patterns

### Background Tasks & Agents
When given multiple tasks, use the Task tool to run agents in parallel with `run_in_background: true`. Check progress with TaskOutput.

### Game Asset Generation
- Use `generate_space_assets.py` to generate game sprites
- Requires: `GOOGLE_API_KEY` env var, `GEMINI_MODEL=gemini-3-pro-image-preview`
- Process: Generate with white background → BiRefNet bg removal → auto-crop
- Reference the `habibi/playground` folder for more asset generation patterns

### General Preferences
- Always prefer editing existing files over creating new ones
- Use parallel agents for independent tasks
- When adding game features, include both visual feedback and sound
- Menu links in games should open in new tabs to preserve game state
