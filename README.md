# Obsidian Concept Explorer

![Concept Explorer Logo](https://img.shields.io/badge/%F0%9F%A7%A0-Concept%20Explorer-blue)

A plugin for Obsidian that uses local LLMs (Large Language Models) to expand and connect concepts. Starting from a single concept, you can explore related concepts across various fields and visualize them through Obsidian's graph view.

## Key Features

- **Concept Expansion**: Automatically generate related concepts from selected text or an input concept
- **Graph Visualization**: Automatically create notes and connect them to visualize concept networks in Obsidian's graph view
- **Customizable Exploration**: Adjust exploration depth, diversity, and other parameters to expand concepts as desired
- **Local Processing**: Uses local LLMs (Ollama) for privacy protection
- **Multiple LLM Options**: Support for Ollama, OpenAI, Claude, Gemini, and Model Context Protocol (MCP)
- **MCP Integration**: Connect to Claude Desktop and other MCP-compatible applications without API keys

## Installation Requirements

1. [Obsidian](https://obsidian.md/) (v0.15.0 or later)
2. [Ollama](https://ollama.ai/) installed and running (for local LLM support)
3. API keys for cloud services (OpenAI, Claude, Gemini) if using those options
4. MCP-compatible applications (Claude Desktop, etc.) for MCP support

## Installation Guide

### 1. Plugin Installation

1. Clone this repository to your Obsidian vault's `.obsidian/plugins/` directory:
   ```bash
   cd YOUR_VAULT_PATH/.obsidian/plugins/
   git clone https://github.com/yourusername/obsidian-concept-explorer.git
   ```

2. Navigate to the plugin directory and install dependencies:
   ```bash
   cd obsidian-concept-explorer
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Restart Obsidian and enable 'Concept Explorer' in Settings → Community plugins.

### 2. Ollama Installation

1. Download and install Ollama for your operating system from the [Ollama website](https://ollama.ai/)

2. Run the Ollama server using the following command in terminal (or command prompt):
   ```bash
   ollama serve
   ```

### 3. LLM Model Download

Download LLM models through Ollama using the following commands in terminal:

```bash
# Llama 3 (recommended)
ollama pull llama3

# Other model options
ollama pull mistral
ollama pull gemma:7b
ollama pull phi:latest
```

#### Using GGUF Models

If you want to use your own GGUF models:

1. Download a GGUF model from [HuggingFace](https://huggingface.co/) or other sources
   - Example: Download `llama-3-8b.Q4_K_M.gguf` from [TheBloke's Llama3](https://huggingface.co/TheBloke/Llama-3-8B-GGUF)

2. Move the downloaded GGUF file to the Ollama models directory:
   - macOS: `~/.ollama/models/`
   - Windows: `C:\Users\USERNAME\.ollama\models\`
   - Linux: `~/.ollama/models/`

3. Create a Modelfile:
   ```
   # Create a file named 'mymodel'
   FROM llama-3-8b.Q4_K_M.gguf
   PARAMETER temperature 0.7
   PARAMETER num_ctx 4096
   ```

4. Create the model:
   ```bash
   ollama create mymodel -f Modelfile
   ```

5. Set the model name to "mymodel" in the plugin settings

### 4. Setting up Model Context Protocol (MCP)

1. Install Claude Desktop or another MCP-compatible application.
   - [Claude Desktop](https://claude.ai/download)
   - Other MCP-compatible applications: Cursor, Cody, Continue, etc.

2. Configure MCP in settings:
   - Select "Model Context Protocol (MCP)" as your LLM service
   - Choose between "stdio" (local server) or "SSE" (remote server) mode
   - For stdio: Configure command and arguments (defaults to OpenAI MCP server)
   - For SSE: Configure the MCP server URL

3. Start the MCP server separately using the command displayed in settings

## Usage

### Basic Usage

1. Start Concept Explorer:
   - Click the brain icon in the ribbon menu
   - Or select "Open Concept Explorer" from the command palette (Ctrl/Cmd+P)

2. Enter a root concept, adjust settings, and click "Start Exploration"

3. Generated concept notes will be automatically connected and viewable in the graph view

### Expand from Selected Text

1. Select specific text (concept) in a note
2. Choose "Expand Selected Concept" from the right-click menu or command palette
3. Set exploration depth and click "Start Expansion"

### Using MCP with Claude Desktop

1. In plugin settings, select "Model Context Protocol (MCP)" as your LLM service
2. For Claude Desktop integration:
   - Use SSE mode with default port settings
   - Create a `claude_desktop_config.json` file in your home directory with this content:
   ```json
   {
     "concept-explorer": {
       "command": "npx",
       "args": ["-y", "@modelcontextprotocol/server-openai"]
     }
   }
   ```
3. Launch Claude Desktop and look for the hammer icon showing an active MCP connection
4. Start concept exploration in Obsidian - Claude will automatically handle the requests

## Project Structure

The plugin follows a modular architecture for maintainability and extensibility:

### Core Structure
- `main.ts` - Main plugin class and initialization
- `src/constants/` - Constants and default settings
- `src/models/` - TypeScript interfaces and type definitions
- `src/utils.ts` - Common utility functions

### Services
- `src/services/` - Service modules
  - `file-manager.ts` - File system operations
  - `clipboard-manager.ts` - Clipboard interaction
  - `graph-manager.ts` - Graph visualization
  - `src/services/llm/` - LLM service implementations
    - `openai.ts` - OpenAI API integration
    - `claude.ts` - Claude API integration
    - `gemini.ts` - Gemini API integration
    - `ollama.ts` - Ollama local LLM integration
    - `mcp.ts` - Model Context Protocol integration

### User Interface
- `src/ui/` - UI components
  - `ConceptExplorerModal.ts` - Main exploration modal
  - `ConceptExpandModal.ts` - Concept expansion modal
  - `ConceptResultModal.ts` - Results display modal
  - `ConceptExplorerSettingTab.ts` - Settings tab

This modular architecture makes it easy to:
- Add new LLM service integrations
- Modify UI components independently
- Extend functionality without affecting the core system

## For Developers

If you want to contribute or modify the plugin:

1. Clone the repository and install dependencies
   ```bash
   git clone https://github.com/yourusername/obsidian-concept-explorer.git
   cd obsidian-concept-explorer
   npm install
   ```

2. Make your changes following the modular structure
   - For new LLM integrations: Add a new service file in `src/services/llm/`
   - For UI changes: Modify the appropriate component in `src/ui/`
   - For utility functions: Add to `src/utils.ts`

3. Build and test your changes
   ```bash
   npm run build
   ```

4. Create a pull request with your changes

## Troubleshooting

1. **Connection Error**: If you see "Local LLM Connection Error" message:
   - Verify Ollama is running (`ollama serve`)
   - Check if the configured model is downloaded (`ollama list`)

2. **Slow Model Loading**: 
   - Use a smaller model (e.g., llama3:8b-q4_0 instead of llama3:7b)
   - Use a quantized version of the model

3. **MCP Connection Issues**:
   - Verify MCP server is running (look for hammer icon in Claude Desktop)
   - Check Claude logs in `~/Library/Logs/Claude/mcp*.log` (Mac) or `%APPDATA%\Claude\logs\mcp*.log` (Windows)
   - Ensure you have the latest versions of MCP-compatible applications

## Configuration Options

The following options can be adjusted in the plugin settings:

- **Language**: Select interface language (English or Korean)
- **LLM Service**: Choose between Ollama (local), OpenAI, Claude, Gemini, or MCP
- **API Keys**: Enter API keys for cloud services (if selected)
- **MCP Settings**: Configure MCP server type (stdio/SSE), command, arguments, and URL
- **Diversity Bias**: Value between 0.0-1.0, higher values produce more diverse concepts (default: 0.8)
- **Default Maximum Depth**: Default exploration depth (default: 3)
- **Concepts Limit**: Maximum number of related concepts to generate per concept (default: 3)
- **Custom Prompt Template**: Create your own prompt template for concept generation
- **Output Folder**: Specify where generated concept notes are saved

## License

MIT

## Contributing

Please submit improvements or bug reports through GitHub issues.

---

Developer: [Your Name](https://github.com/yourusername) 