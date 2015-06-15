(function factory(bundle) {

	if (typeof window !== 'undefined') window.flowMatic = bundle;
	else if (typeof module !== 'undefined') module.exports = bundle;

})(function() {

	var LINE_BREAK = '\r\n';

	FieldTypes = {
		'ABSTRACT':  	'AbstractFieldType',
		'COMP3': 		'Comp3FieldType',
		'COMP': 		'CompFieldType',
		'DATE': 		'DateFieldType',
		'DOUBLE': 		'DoubleFieldType',
		'INDEXED': 		'IndexedFieldType',
		'INTEGER': 		'IntegerFieldType',
		'LONG': 		'LongFieldType',
		'SIGNED_DOUBLE':'SignedDoubleFieldType',
		'SIGNED_LONG': 	'SignedLongFieldType',
		'STRING': 		'StringFieldType'
	};

	function DataField(level, dataName, javaType, size) {
		if (this instanceof DataField) {
			this.subLevels = [];
			this.level = level;
			this.dataName = dataName;
			this.javaType = javaType;
			this.size = size;
		}
	}
	DataField.prototype = {
		isFiller: false,
		subLevels: null,
		dataName: '',
		level: 0,
		javaType: '',
		size: 0
	};

	function SourceData() {
		this.lines = [];
		this.dataFields = [];
	}
	SourceData.prototype = {
		id: '',
		info: '',
		hasLineNumbers: true,
		hasLineComments: true,
		hasLineMarkers: true,

		lines: null,
		dataFields: null
	};

	ImplFactory = (function() {

		function formatDataName(dataName) { return dataName.replace(/-/gim, '_'); }

		function buildFieldDeclarations(fields) {
			var declarations = [];
			fields.forEach(function(field) {
				declarations.push('public static final String ' + formatDataName(field.dataName) + ' = "' + field.dataName + '";');
			});
			return declarations.join(LINE_BREAK);
		}

		function buildCommonAreaMetadata(fields) {
			var build = ['private static final CommonAreaMetaData COMMON_AREA = new CommonAreaMetaData(', 'new FieldType[] {'];
			fields.forEach(function(field) {
				build.push('\tnew ' + field.javaType + '('+ formatDataName(field.dataName) +', ' + field.size + ');')
			});
			build.push('});');
			return build.join(LINE_BREAK +'\t');
		}

		return {
			buildImpl: function(sourceData) {
				return buildFieldDeclarations(sourceData.dataFields) + 
					LINE_BREAK + 
					LINE_BREAK + 
					buildCommonAreaMetadata(sourceData.dataFields);
			}
		};

	})();


	// 
	Parser = (function() {

		var LINE_REGEX = 
			/(\d+)\s+(\S+)\s+(?:PIC(?:TURE)?\s+(?:(S?)(9+)(?:\((\d+)\)(?:(V?)(9+)(?:\((\d+)\))?)?)?|(X+)(?:\((\d+)\))?))/i;
		/*
			0 source
			1 level
			2 data name
			3 hasSign
			4 99999
			5 (N) of integer
			6 V
			7 99999
			8 (N) of decimal
			9 XXXXX
			10 (N) of X
		*/

		function Parser() {}

		Parser.prototype = {

			parse: function (book, hasLineNumbers, hasLineMarkers, hasLineComments) {
				
				var sourceData = new SourceData(); 
				sourceData.lines = (book + '').split(/\r?\n/im);

				sourceData.hasLineNumbers = hasLineNumbers !== false;
				sourceData.hasLineMarkers = sourceData.hasLineNumbers || hasLineMarkers !== false;
				sourceData.hasLineComments = sourceData.hasLineMarkers || hasLineComments !== false;

				sourceData.dataFields = extractFields(sourceData);

				return sourceData;
			}
		}


		function extractFields(sourceData) {

			// obtain fields
			var fields = [];
			var lastField;
			var startIndx = 0;
			var endIndx = 72;
			var fillerCount = 0;

			if (sourceData.hasLineNumbers) {
				startIndx += 13;
				endIndx += 7;
			}
			else if (sourceData.hasLineMarkers) {
				startIndx += 6;
			}

			sourceData.lines.forEach(function(line) {
					line = line.substring(startIndx);


					
					// if is commented
					if (sourceData.hasLineComments && line.charAt(0) === '*') return;

					var matches = line.match(LINE_REGEX);
					if (!matches) return;

					console.log(matches.join(' | '))


					// PREPARE DATAFIELD

					var level = parseInt(matches[1], 10);
					var dataName = String(matches[2]);
					var isFiller = dataName === 'FILLER';
					var javaType;

					//if (dataName==='CCRR1613-TEL-1-DDD') console.log('>',startIndx, line)

				// DEFINE JAVATYPE

					// IF NUMERIC		
					if (matches[4]) {
						var hasSign = !!(matches[3] && matches[3].length);
						var isDecimal = false;
						var integer;
						var decimals = 0;
						if (matches[5]) {
							integer = parseInt(matches[5], 10);
							isDecimal = !!matches[6];
							if (isDecimal) {
								
								if(matches[8]) {
									decimals = parseInt(matches[8], 10);
								}
								else decimals = matches[7].length;
							}
						}
						else integer = matches[4].length;


						if (decimals) {
							javaType = FieldTypes.STRING;
						}
						else if (integer) {
							if (integer < 9) javaType  = FieldTypes.INTEGER;
							else if (integer < 18) javaType  = FieldTypes.LONG;
							else javaType  = FieldTypes.STRING;
						}
						size = (hasSign ? 1:0) + integer + (isDecimal ? 1 : 0) + decimals;
					}
					// IF ALPHA
					else if (matches[9]) {
						javaType = FieldTypes.STRING;
						size = matches[10] ? parseInt(matches[10], 10) : matches[9].length;
					}

					if (isFiller) {
						dataName += '_' + fillerCount++;
						javaType = FieldTypes.STRING;
					}

					if (javaType && size) {
						var dataField = new DataField(level, dataName, javaType, size);
						dataField.isFiller = isFiller;
						//if (lastField && dataField.level > lastField.level) lastField.subLevels.push(dataField);
						//else fields.push(dataField);
						fields.push(dataField);
						lastField = dataField;
					}
					else throw 'Could not define the '+(javaType ? 'size' : 'data type')+' of '+ dataField;
				});

			return fields;
		}


		return Parser;

	})();

});