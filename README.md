# render-drawio

GitHub Action that looks for drawio files in a repo, and renders PNGs of each of them in place.

## Inputs

### `GH_TOKEN`

The GitHub token used to authenticate with GitHub.

**Required**

### `IGNORE_FILE_PATTERNS`

Paths to not render.

**Optional**

### `COMMIT_MESSAGE`

Commit message to post when rendering PNGs.

**Required**

**Default Value**

If unspecified, it defaults to the following message:

```
Render diagrams
```

## Example Usage

```yml
- name: Render DrawIO Diagrams
  uses: gps/render-drawio@master
  with:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
