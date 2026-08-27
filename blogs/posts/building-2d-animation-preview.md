# Building 2D Animation Preview inside Unity's normal Inspector

When I work with sliced sprite sheets in Unity, I often want to answer one quick question: does this sequence actually look right when it moves? The usual workflow can require creating an animation clip or moving to another window before I can check the timing, ordering, and pivots.

I built 2D Animation Preview to make that check available directly inside Unity's normal Texture Importer Inspector.

> **Key takeaways**
> - The preview appears where the sprite-sheet setup already happens.
> - It is editor-only and adds no runtime dependency to the game.
> - Clear limitations are better than pretending every texture layout can be supported safely.

![Four illustrated sprite frames beside the playback controls in 2D Animation Preview](images/blog/animation-preview.svg)

## Why I kept it inside the existing Inspector

The easiest version of this idea would have been a separate EditorWindow. I decided against that because previewing a sliced texture is part of the import workflow, not a separate production task.

The tool adds a 2D Animation Preview foldout below Unity's normal importer header. It does not replace the Texture Importer or duplicate all of its fields. Unity remains responsible for texture settings and slicing; my tool adds the focused playback controls that are missing from that moment in the workflow.

This extension point keeps context switching low. Select one texture configured as Sprite (2D and UI) with Sprite Mode set to Multiple, slice and apply it, then use the preview in the same Inspector.

## The controls stay deliberately small

The preview supports play and pause, first and last frame, previous and next frame, frame scrubbing, looping, and playback from 1 to 60 FPS. Frames use numeric-aware ordering, so a name such as `Idle_2` correctly comes before `Idle_10`.

Pivot-aligned rendering is also important. Animation can appear to shake even when the artwork is correct if frames are drawn without respecting their sprite pivots. The preview follows those pivots so it represents the imported sprites more honestly.

The goal was not to build another animation editor. The goal was to provide enough control to inspect a sequence quickly and then return to the real work.

## Editor state and lifecycle mattered more than the buttons

Playback controls are the visible part, but the harder problem is owning preview state correctly inside the Unity Editor.

The selected texture can change. Assets can be reimported. Sprite metadata can be edited. The Inspector can be rebuilt, disabled, or shown for an unsupported selection. The preview must respond to those lifecycle changes without leaving stale frames, callbacks, or playback state behind.

Keeping the package editor-only provides a clean boundary. Preview state belongs to the editor session, and no preview code or dependency needs to enter the player's build.

## Supporting the valid case and hiding the rest

The preview intentionally appears only for one selected Sprite Mode Multiple texture. It stays hidden for single sprites, non-sprite textures, and multi-selection. Tightly packed sprites are not supported because Unity does not expose the source texture rectangles needed for this inline preview.

Those limits are part of the design. Showing a control that produces an unreliable result would make the tool harder to trust. When the valid inputs are narrow, the UI should communicate that through predictable visibility and useful troubleshooting guidance.

## Preparing it as a real package

The version 1.0.0 package targets Unity 2022.3.40f1 or newer and works independently of the Built-in Render Pipeline, URP, and HDRP. It includes documentation and a CC0 Goose sample with Idle, Walk, Run, and Flap sprite sheets for a quick first test.

Packaging forced me to review more than the core feature: assembly boundaries, refresh behavior after asset changes, sample provenance, third-party notices, versioned release files, and the exact import experience a customer receives.

That is the difference between a useful editor script and a product I can support.

— Wahib
