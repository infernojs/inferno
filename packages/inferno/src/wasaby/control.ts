function getModuleDefaultCtor(mod) {
   // @ts-nocheck
   return typeof mod === 'function' ? mod : mod.constructor;
}

function getControlNodeParams(control, environment) {
   // @ts-ignore
   const composedDecorator = composeWithResultApply.call(undefined, [environment.getMarkupNodeDecorator()]).bind(control);
   return {
      defaultOptions: {}, // нет больше понятия опция по умолчанию
      markupDecorator: composedDecorator
   };
}

function collectObjectVersions(collection) {
   const versions = {};
   for (const key in collection) {
      if (collection.hasOwnProperty(key)) {
         if (collection[key] && collection[key].getVersion) {
            versions[key] = collection[key].getVersion();
         } else if (collection[key] && collection[key].isDataArray) {
            
            // тут нужно собрать версии всех объектов,
            // которые используются внутри контентных опций
            // здесь учитывается кейс, когда внутри контентной опции
            // есть контентная опция
            // по итогу получаем плоский список всех версий всех объектов
            // внутри контентных опций
            for (let kfn = 0; kfn < collection[key].length; kfn++) {
               const innerVersions = collectObjectVersions(collection[key][kfn].internal || {});
               for(const innerKey in innerVersions) {
                  if (innerVersions.hasOwnProperty(innerKey)) {
                     versions[key + ';' + kfn + ';' + innerKey] = innerVersions[innerKey];
                  }
               }
            }
         }
      }
   }
   return versions;
}

function shallowMerge(dest, src) {
   let i;
   for (i in src) {
      if (src.hasOwnProperty(i)) {
         dest[i] = src[i];
      }
   }
   return dest;
}

function fixInternalParentOptions(internalOptions, userOptions, parentNode) {
   // У compound-контрола parent может уже лежать в user-опциях, берем его оттуда, если нет нашей parentNode
   internalOptions.parent = internalOptions.parent || (parentNode && parentNode.control) || userOptions.parent || null;
   internalOptions.logicParent =
      internalOptions.logicParent ||
      (parentNode && parentNode.control && parentNode.control.logicParent) ||
      userOptions.logicParent ||
      null;
}

export function createNode(controlClass_, options, key, environment, parentNode, serialized, vnode?) {
   const controlCnstr = getModuleDefaultCtor(controlClass_);
   const compound = vnode && vnode.compound;
   const serializedState = (serialized && serialized.state) || { vdomCORE: true }; // сериализованное состояние компонента
   const userOptions = options.user; // прикладные опции
   const internalOptions = options.internal || {}; // служебные опции
   let result;

      fixInternalParentOptions(internalOptions, userOptions, parentNode);

      if (!key) {
         /*У каждой ноды должен быть ключ
          * for строит внутренние ноды относительно этого ключа
          * */
         key = '_';
      }

      if (compound) {
         // Создаем виртуальную ноду для compound контрола
         // @ts-ignore
         if (!DirtyCheckingCompatible) {
            // @ts-ignore
            DirtyCheckingCompatible = _dcc;
         }
         // @ts-ignore
         result = DirtyCheckingCompatible.createCompoundControlNode(
            controlClass_,
            controlCnstr,
            userOptions,
            internalOptions,
            key,
            parentNode,
            vnode
         );
      } else {
      // Создаем виртуальную ноду для не-compound контрола
      const invisible = vnode && vnode.invisible;
         // подмешиваем сериализованное состояние к прикладным опциям
      let optionsWithState = serializedState ? shallowMerge(userOptions, serializedState) : userOptions;
      let optionsVersions;
      let contextVersions;
      let control;
      // @ts-ignore
      let params;
      let context;
      let instCompat;
      let defaultOptions;
         
         if (typeof controlClass_ === 'function') {
            // создаем инстанс компонента
            // @ts-ignore
            instCompat = Compatible.createInstanceCompatible(controlCnstr, optionsWithState, internalOptions);
            control = instCompat.instance;
            optionsWithState = instCompat.resolvedOptions;
            defaultOptions = instCompat.defaultOptions;
         } else {
            // инстанс уже есть, работаем с его опциями
            control = controlClass_;
            // @ts-ignore
            defaultOptions = OptionsResolver.getDefaultOptions(controlClass_);
            // @ts-ignore
            if (isJs.compat) {
               // @ts-ignore
               optionsWithState = Compatible.combineOptionsIfCompatible(
                  controlCnstr.prototype,
                  optionsWithState,
                  internalOptions
               );
               if (control._setInternalOptions) {
                  control._options.doNotSetParent = true;
                  control._setInternalOptions(internalOptions || {});
               }
            }
         }

         // check current options versions
         optionsVersions = collectObjectVersions(optionsWithState);
         // check current context field versions
         context = (vnode && vnode.context) || {};
         contextVersions = collectObjectVersions(context);
         params = getControlNodeParams(control, environment);

         result = new WCN(
            options, 
            control,
            controlCnstr,
            optionsWithState,
            internalOptions,
            optionsVersions,
            serialized,
            parentNode,
            key,
            invisible,
            params,
            defaultOptions,
            vnode,
            contextVersions
         );

         environment.setupControlNode(result);

         

         return result;

      }
}

function WCN(
   options, 
   control, 
   controlCnstr, 
   optionsWithState, 
   internalOptions,
   optionsVersions,
   serialized, 
   parentNode, 
   key,
   invisible,
   params,
   defaultOptions,
   vnode,
   contextVersions) {
      this.attributes = options.attriutes;
      this.events = options.events;
      this.control = control;
      this.errors = serialized && serialized.errors;
      this.controlClass = controlCnstr;
      this.options = optionsWithState;
      this.internalOptions = internalOptions;
      this.optionsVersions = optionsVersions;
      this.id = control._instId || 0;
      this.parent = parentNode;
      this.key = key;
      this.defaultOptions = defaultOptions;
      this.markup = invisible ? createTextVNode('') : undefined;
      this.fullMarkup = undefined;
      this.childrenNodes = [];
      this.markupDecorator = params && params.markupDecorator;
      this.serializedChildren = serialized && serialized.childrenNodes;
      this.hasCompound = false;
      this.receivedState = undefined;
      this.invisible = invisible;

      this.contextVersions = contextVersions;
      this.context = (vnode && vnode.context) || {},
      this.inheritOptions = (vnode && vnode.inheritOptions) || {}
}

export interface WasabyCompatControlNode {
   control: any,
   controlClass: any,
   options: any,
   id: any,
   parent: any,
   key: string | number,
   element: any,
   markup: any,
   fullMarkup: any,
   childrenNodes: any,
   compound: true
}

export interface WasabyControlNode {
   attributes: object,
   events: any,
   control: any,
   errors: any,
   controlClass: any,
   options: object,
   internalOptions: object,
   optionsVersions: object,
   id: any,
   parent: any,
   key: string | number,
   defaultOptions: any,
   markup: any,
   fullMarkup: any,
   childrenNodes: object,
   markupDecorator: any,
   serializedChildren: any,
   hasCompound: boolean,
   receivedState: any,
   invisible: any,
   contextVersions: any,
   context: object,
   inheritOptions: object
}