# Shipping Waypoint Path System: NPC routes built in the Scene View

Waypoint Path System started with a problem I kept meeting in Unity projects: an NPC route may be simple at runtime, but creating and adjusting that route is often slower than it should be. Manually placing waypoint objects, checking their order, and repeatedly entering Play Mode turns a small gameplay task into an awkward authoring loop.

I built the tool to move that work into the place where it makes the most sense: Unity's Scene View.

> **Key takeaways**
> - Routes should be easy to read and edit before entering Play Mode.
> - The editor handles authoring while the runtime stays focused on movement and behavior.
> - Flexible traversal is useful only when designers can understand and control it.

![Waypoint Path System showing several editable routes in Unity's Scene View](images/pathnpc/scene-overview.png)

## The workflow I wanted

The basic loop is direct: select the path tool, click in the Scene View to place waypoints, adjust the route visually, and assign it to an NPC using Unity's built-in NavMeshAgent.

That sounds small, but it changes the feel of the work. The route is visible while I build it. Its order is clear. I can see whether a turn is too sharp or whether a stop is in the wrong place without digging through a hierarchy of nearly identical objects.

The tool supports OneShot, Loop, PingPong, and Random traversal. Paths can stay straight or use Catmull-Rom and Bezier smoothing. Each waypoint can also carry its own wait time and movement speed, which makes the path more than a list of positions.

## Separating authoring from runtime behavior

One of the important design decisions was keeping the editor experience and runtime responsibility separate.

The editor owns route creation, handles, visual feedback, keyboard shortcuts, validation, and Undo. The runtime owns movement through the route, waypoint arrival, traversal rules, and interaction with NavMeshAgent. This boundary keeps editor-only code out of builds and makes the movement behavior easier to reason about.

It also makes the tool useful beyond a single demo. A route can drive one agent or be reused for a crowd. Gameplay code can react through UnityEvents instead of modifying the path system itself.

## Handling interruptions without losing the route

A patrol system becomes much more useful when it can stop being a patrol system for a moment.

Waypoint Path System supports priority-based interruptions and resuming. An NPC can leave its current route for a higher-priority destination, then continue its previous work instead of forgetting where it was. Save and restore support follows the same principle: the tool should preserve meaningful movement state rather than force every project to rebuild it around the package.

This was one of the areas where the runtime needed more care than the editor visuals suggest. Movement state, current waypoint, direction, and interruption priority must agree. If ownership is unclear, the NPC may resume at the wrong point or accept a lower-priority request at the wrong time.

## Making flexibility visible

Features are not enough if the Inspector hides how they work. The custom Inspector groups route settings, NPC controls, per-waypoint behavior, and events so the configuration remains readable. The Scene View shows the ordered path and curve shape directly.

![Waypoint Path System Inspector with route, movement, and waypoint controls](images/pathnpc/inspector.png)

I wanted a designer to answer the important questions without reading the source code: Which path mode is active? Where does the agent go next? Is smoothing enabled? What happens when a waypoint is reached?

That designer-facing clarity became part of the product, not decoration added after the runtime was complete.

## What shipping the tool taught me

Building the feature set was only part of releasing Waypoint Path System. The package also needed documentation, sample content, predictable folder structure, licensing checks, clean import behavior, and screenshots that prove the actual workflow.

The main lesson was simple: a Unity tool is not finished when its code works in its original project. It is finished when another developer can import it, understand it, use it safely, and recover when something goes wrong.

Waypoint Path System is available on the [Unity Asset Store](https://assetstore.unity.com/packages/tools/game-toolkits/waypoint-path-system-390624), and the [GitHub repository](https://github.com/yqwz1/waypoint-path-system-tool) contains the public documentation.

— Wahib
