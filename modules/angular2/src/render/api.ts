import {isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {List, Map} from 'angular2/src/facade/collection';
import {ASTWithSource} from 'angular2/change_detection';

/**
 * General notes:
 *
 * The methods for creating / destroying views in this API are used in the AppViewHydrator
 * and RenderViewHydrator as well.
 *
 * We are already parsing expressions on the render side:
 * - this makes the ElementBinders more compact
 *   (e.g. no need to distinguish interpolations from regular expressions from literals)
 * - allows to retrieve which properties should be accessed from the event
 *   by looking at the expression
 * - we need the parse at least for the `template` attribute to match
 *   directives in it
 * - render compiler is not on the critical path as
 *   its output will be stored in precompiled templates.
 */
export class EventBinding {
  fullName: string;  // name/target:name, e.g "click", "window:resize"
  source: ASTWithSource;

  constructor(fullName: string, source: ASTWithSource) {
    this.fullName = fullName;
    this.source = source;
  }
}

export class ElementBinder {
  index: number;
  parentIndex: number;
  distanceToParent: number;
  directives: List<DirectiveBinder>;
  nestedProtoView: ProtoViewDto;
  propertyBindings: Map<string, ASTWithSource>;
  variableBindings: Map<string, ASTWithSource>;
  // Note: this contains a preprocessed AST
  // that replaced the values that should be extracted from the element
  // with a local name
  eventBindings: List<EventBinding>;
  textBindings: List<ASTWithSource>;
  readAttributes: Map<string, string>;

  constructor({index, parentIndex, distanceToParent, directives, nestedProtoView, propertyBindings,
               variableBindings, eventBindings, textBindings, readAttributes}: {
    index?: number,
    parentIndex?: number,
    distanceToParent?: number,
    directives?: List<DirectiveBinder>,
    nestedProtoView?: ProtoViewDto,
    propertyBindings?: Map<string, ASTWithSource>,
    variableBindings?: Map<string, ASTWithSource>,
    eventBindings?: List<EventBinding>,
    textBindings?: List<ASTWithSource>,
    readAttributes?: Map<string, string>
  } = {}) {
    this.index = index;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
    this.directives = directives;
    this.nestedProtoView = nestedProtoView;
    this.propertyBindings = propertyBindings;
    this.variableBindings = variableBindings;
    this.eventBindings = eventBindings;
    this.textBindings = textBindings;
    this.readAttributes = readAttributes;
  }
}

export class DirectiveBinder {
  // Index into the array of directives in the View instance
  directiveIndex: number;
  propertyBindings: Map<string, ASTWithSource>;
  // Note: this contains a preprocessed AST
  // that replaced the values that should be extracted from the element
  // with a local name
  eventBindings: List<EventBinding>;
  hostPropertyBindings: Map<string, ASTWithSource>;
  constructor({directiveIndex, propertyBindings, eventBindings, hostPropertyBindings}: {
    directiveIndex?: number,
    propertyBindings?: Map<string, ASTWithSource>,
    eventBindings?: List<EventBinding>,
    hostPropertyBindings?: Map<string, ASTWithSource>
  }) {
    this.directiveIndex = directiveIndex;
    this.propertyBindings = propertyBindings;
    this.eventBindings = eventBindings;
    this.hostPropertyBindings = hostPropertyBindings;
  }
}

export class ProtoViewDto {
  // A view that contains the host element with bound
  // component directive.
  // Contains a view of type #COMPONENT_VIEW_TYPE.
  static get HOST_VIEW_TYPE() { return 0; }
  // The view of the component
  // Can contain 0 to n views of type #EMBEDDED_VIEW_TYPE
  static get COMPONENT_VIEW_TYPE() { return 1; }
  // A view that is embedded into another View via a <template> element
  // inside of a component view
  static get EMBEDDED_VIEW_TYPE() { return 2; }

  render: RenderProtoViewRef;
  elementBinders: List<ElementBinder>;
  variableBindings: Map<string, string>;
  type: number;

  constructor({render, elementBinders, variableBindings, type}: {
    render?: RenderProtoViewRef,
    elementBinders?: List<ElementBinder>,
    variableBindings?: Map<string, string>,
    type?: number
  }) {
    this.render = render;
    this.elementBinders = elementBinders;
    this.variableBindings = variableBindings;
    this.type = type;
  }
}

export class DirectiveMetadata {
  static get DIRECTIVE_TYPE() { return 0; }
  static get COMPONENT_TYPE() { return 1; }
  id: any;
  selector: string;
  compileChildren: boolean;
  events: List<string>;
  hostListeners: Map<string, string>;
  hostProperties: Map<string, string>;
  hostAttributes: Map<string, string>;
  hostActions: Map<string, string>;
  properties: Map<string, string>;
  readAttributes: List<string>;
  type: number;
  callOnDestroy: boolean;
  callOnChange: boolean;
  callOnCheck: boolean;
  callOnInit: boolean;
  callOnAllChangesDone: boolean;
  changeDetection: string;
  constructor({id, selector, compileChildren, events, hostListeners, hostProperties, hostAttributes,
               hostActions, properties, readAttributes, type, callOnDestroy, callOnChange,
               callOnCheck, callOnInit, callOnAllChangesDone, changeDetection}: {
    id?: string,
    selector?: string,
    compileChildren?: boolean,
    events?: List<string>,
    hostListeners?: Map<string, string>,
    hostProperties?: Map<string, string>,
    hostAttributes?: Map<string, string>,
    hostActions?: Map<string, string>,
    properties?: Map<string, string>,
    readAttributes?: List<string>,
    type?: number,
    callOnDestroy?: boolean,
    callOnChange?: boolean,
    callOnCheck?: boolean,
    callOnInit?: boolean,
    callOnAllChangesDone?: boolean,
    changeDetection?: string
  }) {
    this.id = id;
    this.selector = selector;
    this.compileChildren = isPresent(compileChildren) ? compileChildren : true;
    this.events = events;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.hostAttributes = hostAttributes;
    this.hostActions = hostActions;
    this.properties = properties;
    this.readAttributes = readAttributes;
    this.type = type;
    this.callOnDestroy = callOnDestroy;
    this.callOnChange = callOnChange;
    this.callOnCheck = callOnCheck;
    this.callOnInit = callOnInit;
    this.callOnAllChangesDone = callOnAllChangesDone;
    this.changeDetection = changeDetection;
  }
}

// An opaque reference to a DomProtoView
export class RenderProtoViewRef {}

// An opaque reference to a DomView
export class RenderViewRef {}

export class ViewDefinition {
  componentId: string;
  absUrl: string;
  template: string;
  directives: List<DirectiveMetadata>;

  constructor({componentId, absUrl, template, directives}: {
    componentId?: string,
    absUrl?: string,
    template?: string,
    directives?: List<DirectiveMetadata>
  }) {
    this.componentId = componentId;
    this.absUrl = absUrl;
    this.template = template;
    this.directives = directives;
  }
}

export class RenderCompiler {
  /**
   * Creats a ProtoViewDto that contains a single nested component with the given componentId.
   */
  compileHost(directiveMetadata: DirectiveMetadata): Promise<ProtoViewDto> { return null; }

  /**
   * Compiles a single DomProtoView. Non recursive so that
   * we don't need to serialize all possible components over the wire,
   * but only the needed ones based on previous calls.
   */
  compile(template: ViewDefinition): Promise<ProtoViewDto> { return null; }
}

export class Renderer {
  /**
   * Creates a root host view that includes the given element.
   * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
   * ProtoViewDto.HOST_VIEW_TYPE
   * @param {any} hostElementSelector css selector for the host element (will be queried against the
   * main document)
   * @return {RenderViewRef} the created view
   */
  createRootHostView(hostProtoViewRef: RenderProtoViewRef,
                     hostElementSelector: string): RenderViewRef {
    return null;
  }

  /**
   * Detaches a free host view's element from the DOM.
   */
  detachFreeHostView(parentHostViewRef: RenderViewRef, hostViewRef: RenderViewRef) {}

  /**
   * Creates a regular view out of the given ProtoView
   */
  createView(protoViewRef: RenderProtoViewRef): RenderViewRef { return null; }

  /**
   * Destroys the given view after it has been dehydrated and detached
   */
  destroyView(viewRef: RenderViewRef) {}

  /**
   * Attaches a componentView into the given hostView at the given element
   */
  attachComponentView(hostViewRef: RenderViewRef, elementIndex: number,
                      componentViewRef: RenderViewRef) {}

  /**
   * Detaches a componentView into the given hostView at the given element
   */
  detachComponentView(hostViewRef: RenderViewRef, boundElementIndex: number,
                      componentViewRef: RenderViewRef) {}

  /**
   * Attaches a view into a ViewContainer (in the given parentView at the given element) at the
   * given index.
   */
  attachViewInContainer(parentViewRef: RenderViewRef, boundElementIndex: number, atIndex: number,
                        viewRef: RenderViewRef) {}

  /**
   * Detaches a view into a ViewContainer (in the given parentView at the given element) at the
   * given index.
   */
  // TODO(tbosch): this should return a promise as it can be animated!
  detachViewInContainer(parentViewRef: RenderViewRef, boundElementIndex: number, atIndex: number,
                        viewRef: RenderViewRef) {}

  /**
   * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  hydrateView(viewRef: RenderViewRef) {}

  /**
   * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  dehydrateView(viewRef: RenderViewRef) {}

  /**
   * Sets a property on an element.
   * Note: This will fail if the property was not mentioned previously as a host property
   * in the ProtoView
   */
  setElementProperty(viewRef: RenderViewRef, elementIndex: number, propertyName: string,
                     propertyValue: any) {}

  /**
   * Calls an action.
   * Note: This will fail if the action was not mentioned previously as a host action
   * in the ProtoView
   */
  callAction(viewRef: RenderViewRef, elementIndex: number, actionExpression: string,
             actionArgs: any) {}

  /**
   * Sets the value of a text node.
   */
  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string) {}

  /**
   * Sets the dispatcher for all events of the given view
   */
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: EventDispatcher) {}
}


/**
 * A dispatcher for all events happening in a view.
 */
export interface EventDispatcher {
  /**
   * Called when an event was triggered for a on-* attribute on an element.
   * @param {Map<string, any>} locals Locals to be used to evaluate the
   *   event expressions
   */
  dispatchEvent(elementIndex: number, eventName: string, locals: Map<string, any>);
}
