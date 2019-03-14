function getModuleDefaultCtor(mod) {
   return typeof mod === 'function' ? mod : mod['constructor'];
}

function getControlNodeParams(control, controlClass, environment) {
   //@ts-ignore
   var composedDecorator = composeWithResultApply.call(undefined, [environment.getMarkupNodeDecorator()]).bind(control);
   return {
      markupDecorator: composedDecorator,
      defaultOptions: {} //нет больше понятия опция по умолчанию
   };
}

function collectObjectVersions(collection) {
   var versions = {};
   for (var key in collection) {
      if (collection.hasOwnProperty(key)) {
         if (collection[key] && collection[key].getVersion) {
            versions[key] = collection[key].getVersion();
         } else if (collection[key] && collection[key].isDataArray) {
            
            //тут нужно собрать версии всех объектов,
            //которые используются внутри контентных опций
            //здесь учитывается кейс, когда внутри контентной опции
            //есть контентная опция
            //по итогу получаем плоский список всех версий всех объектов
            //внутри контентных опций
            for (var kfn = 0; kfn < collection[key].length; kfn++) {
               var innerVersions = collectObjectVersions(collection[key][kfn].internal || {});
               for(var innerKey in innerVersions) {
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
   var i;
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
   let controlCnstr = getModuleDefaultCtor(controlClass_),
      compound = vnode && vnode.compound,
      serializedState = (serialized && serialized.state) || { vdomCORE: true }, // сериализованное состояние компонента
      userOptions = options.user, // прикладные опции
      internalOptions = options.internal || {}, // служебные опции
      result;

      fixInternalParentOptions(internalOptions, userOptions, parentNode);

      if (!key) {
         /*У каждой ноды должен быть ключ
          * for строит внутренние ноды относительно этого ключа
          * */
         key = '_';
      }

      if (compound) {
         // Создаем виртуальную ноду для compound контрола
         //@ts-ignore
         if (!DirtyCheckingCompatible) {
            // @ts-ignore
            DirtyCheckingCompatible = _dcc;
         }
         //@ts-ignore
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
      let
         invisible = vnode && vnode.invisible,
         // подмешиваем сериализованное состояние к прикладным опциям
         optionsWithState = serializedState ? shallowMerge(userOptions, serializedState) : userOptions,
         optionsVersions,
         contextVersions,
         control,
         params,
         context,
         instCompat,
         defaultOptions;
         
         if (typeof controlClass_ === 'function') {
            // создаем инстанс компонента
            //@ts-ignore
            instCompat = Compatible.createInstanceCompatible(controlCnstr, optionsWithState, internalOptions);
            control = instCompat.instance;
            optionsWithState = instCompat.resolvedOptions;
            defaultOptions = instCompat.defaultOptions;
         } else {
            // инстанс уже есть, работаем с его опциями
            control = controlClass_;
            //@ts-ignore
            defaultOptions = OptionsResolver.getDefaultOptions(controlClass_);
            //@ts-ignore
            if (isJs.compat) {
               //@ts-ignore
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

      }
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