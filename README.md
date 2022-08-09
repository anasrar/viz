# Viz

Keystroke and Mouse Visualizer

## Development

### Setup

- clone this repository
  ```bash
  git clone https://github.com/anasrar/viz && cd viz
  ```
- run to install dependency and generate icon
  ```bash
  yarn
  yarn icon
  ```
- run to build papan (global keyboard and mouse listener)

  #### Unix

  ```bash
  cd python
  python -m venv .venv
  source .venv/bin/activate
  pip install -r ./requirements.txt
  pyinstaller papan.py -y --clean --onefile
  pyinstaller papan_server.py -y --clean --onefile
  ```

  #### Windows (Powershell)

  ```bash
  cd python
  python -m venv .venv
  .\.venv\Scripts\Activate
  pip install -r ./requirements.txt
  pyinstaller papan.py -y --clean --onefile
  pyinstaller papan_server.py -y --clean --onefile
  ```

### Build

- run `yarn build`
- output in `release` folder

## How To Contribute

- fork
- change something
- summary what is change in [changelog.md](changelog.md)
- commit with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- pull request

## Built With

- [https://github.com/electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react)
- [https://github.com/electron/electron](https://github.com/electron/electron)
- [https://github.com/electron-userland/electron-builder](https://github.com/electron-userland/electron-builder)
- [https://github.com/vitejs/vite](https://github.com/vitejs/vite)
- [https://github.com/vitest-dev/vitest](https://github.com/vitest-dev/vitest)
- [https://github.com/facebook/react/](https://github.com/facebook/react/)
- [https://github.com/mantinedev/mantine](https://github.com/mantinedev/mantine)
- [https://github.com/molefrog/wouter](https://github.com/molefrog/wouter)
- [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
- [https://github.com/lovell/sharp](https://github.com/lovell/sharp)
- [https://github.com/rsms/inter/](https://github.com/rsms/inter/)
- [https://github.com/tabler/tabler-icons](https://github.com/tabler/tabler-icons)
- [https://github.com/boppreh/mouse](https://github.com/boppreh/mouse)
- [https://github.com/boppreh/keyboard](https://github.com/boppreh/keyboard)
- [https://github.com/eslint/eslint](https://github.com/eslint/eslint)
- [https://github.com/prettier/prettier](https://github.com/prettier/prettier)
